import { getDiscordClient } from './discord-client.js';
import { getUsers, addUser, getUser, updateUserTrophies, getUserTrophies } from './storage.js';
import { authenticatePSN, getPSNTrophies, getNewTrophies } from './psn-tracker.js';
import { initializeSteam, getSteamAchievements, getNewAchievements } from './steam-tracker.js';
import cron from 'node-cron';

const NOTIFICATION_CHANNEL = process.env.DISCORD_CHANNEL_ID || null;
const CHECK_INTERVAL = '*/30 * * * *';

let client = null;
let psnAuth = null;

export async function startBot() {
  console.log('Starting Achievement Tracker Bot...');

  if (process.env.PSN_NPSSO) {
    try {
      psnAuth = await authenticatePSN(process.env.PSN_NPSSO);
      console.log('PSN authentication successful');
    } catch (error) {
      console.error('PSN authentication failed:', error.message);
    }
  }

  if (process.env.STEAM_API_KEY) {
    initializeSteam(process.env.STEAM_API_KEY);
    console.log('Steam API initialized');
  }

  console.log('Connecting to Discord...');
  client = await getDiscordClient();
  console.log('Discord client created, waiting for ready event...');
  
  client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
    console.log('Bot is ready!');
    
    cron.schedule(CHECK_INTERVAL, () => {
      checkAllUserAchievements();
    });
    
    console.log(`Scheduled achievement checks every 30 minutes`);
  });

  client.on('error', (error) => {
    console.error('Discord client error:', error);
  });

  client.on('warn', (warning) => {
    console.warn('Discord client warning:', warning);
  });

  client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const content = message.content.trim();
    
    if (content.startsWith('!register')) {
      await handleRegister(message);
    } else if (content === '!check') {
      await handleCheck(message);
    } else if (content === '!mystats') {
      await handleMyStats(message);
    } else if (content === '!help') {
      await handleHelp(message);
    } else if (content.startsWith('!setchannel')) {
      await handleSetChannel(message);
    }
  });

  return client;
}

async function handleRegister(message) {
  const parts = message.content.split(' ');
  
  if (parts.length < 2) {
    await message.reply('Usage: `!register psn:YourPSNID` or `!register steam:YourSteamID64` or both separated by space');
    return;
  }

  let psnId = null;
  let steamId = null;

  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    if (part.startsWith('psn:')) {
      psnId = part.substring(4);
    } else if (part.startsWith('steam:')) {
      steamId = part.substring(6);
    }
  }

  if (!psnId && !steamId) {
    await message.reply('Please specify at least one account: `psn:YourPSNID` or `steam:YourSteamID64`');
    return;
  }

  addUser(message.author.id, psnId, steamId);
  
  let response = `Registered ${message.author.username}:\n`;
  if (psnId) response += `- PSN: ${psnId}\n`;
  if (steamId) response += `- Steam: ${steamId}\n`;
  response += '\nYour achievements will be tracked automatically!';
  
  await message.reply(response);

  await checkUserAchievements(message.author.id, message.channel);
}

async function handleCheck(message) {
  await message.reply('Checking for new achievements across all registered users...');
  await checkAllUserAchievements();
}

async function handleMyStats(message) {
  const user = getUser(message.author.id);
  
  if (!user) {
    await message.reply('You are not registered! Use `!register psn:YourPSNID steam:YourSteamID64` to register.');
    return;
  }

  let stats = `**Stats for ${message.author.username}:**\n\n`;
  
  if (user.psnId) {
    const psnTrophies = getUserTrophies(message.author.id, 'psn');
    const trophyCount = Object.keys(psnTrophies).length;
    stats += `🎮 PSN (${user.psnId}): ${trophyCount} trophies tracked\n`;
  }
  
  if (user.steamId) {
    const steamAchievements = getUserTrophies(message.author.id, 'steam');
    const achievementCount = Object.keys(steamAchievements).length;
    stats += `🎮 Steam (${user.steamId}): ${achievementCount} achievements tracked\n`;
  }

  await message.reply(stats);
}

async function handleHelp(message) {
  const helpText = `
**Achievement Tracker Bot Commands:**

\`!register psn:YourPSNID steam:YourSteamID64\` - Register your gaming accounts
\`!mystats\` - View your tracked achievements
\`!check\` - Manually trigger achievement check for all users
\`!setchannel\` - Set current channel for notifications (Admin only)
\`!help\` - Show this help message

**How it works:**
- Register your PSN and/or Steam accounts
- The bot checks for new achievements every 30 minutes
- When you earn a new trophy or achievement, it's posted to the notification channel!
  `;
  
  await message.reply(helpText);
}

async function handleSetChannel(message) {
  if (!message.member.permissions.has('Administrator')) {
    await message.reply('Only administrators can set the notification channel.');
    return;
  }

  process.env.DISCORD_CHANNEL_ID = message.channel.id;
  await message.reply(`✅ Notification channel set to ${message.channel.name}`);
}

async function checkAllUserAchievements() {
  const users = getUsers();
  const notificationChannel = NOTIFICATION_CHANNEL ? await client.channels.fetch(NOTIFICATION_CHANNEL) : null;

  for (const [discordId, userData] of Object.entries(users)) {
    await checkUserAchievements(discordId, notificationChannel);
  }
}

async function checkUserAchievements(discordId, channel) {
  const user = getUser(discordId);
  if (!user) return;

  if (user.psnId && psnAuth) {
    try {
      const oldTrophies = getUserTrophies(discordId, 'psn');
      const newTrophyData = await getPSNTrophies(user.psnId, psnAuth);
      const newTrophies = getNewTrophies(oldTrophies, newTrophyData);

      if (newTrophies.length > 0 && channel) {
        for (const trophy of newTrophies) {
          const embed = {
            color: 0xFFD700,
            title: '🏆 New PSN Trophy!',
            fields: [
              { name: 'Player', value: `<@${discordId}>`, inline: true },
              { name: 'Game', value: trophy.gameName, inline: true },
              { name: 'Trophy', value: trophy.trophyName, inline: false },
              { name: 'Description', value: trophy.trophyDetail || 'No description', inline: false },
              { name: 'Type', value: trophy.trophyType, inline: true },
              { name: 'Earned', value: new Date(trophy.earnedDateTime).toLocaleString(), inline: true }
            ],
            timestamp: new Date(trophy.earnedDateTime)
          };
          
          await channel.send({ embeds: [embed] });
        }
      }

      updateUserTrophies(discordId, 'psn', newTrophyData);
    } catch (error) {
      console.error(`Failed to check PSN trophies for ${user.psnId}:`, error.message);
    }
  }

  if (user.steamId && process.env.STEAM_API_KEY) {
    try {
      const oldAchievements = getUserTrophies(discordId, 'steam');
      const newAchievementData = await getSteamAchievements(user.steamId);
      const newAchievements = getNewAchievements(oldAchievements, newAchievementData);

      if (newAchievements.length > 0 && channel) {
        for (const achievement of newAchievements) {
          const embed = {
            color: 0x1B2838,
            title: '🎮 New Steam Achievement!',
            fields: [
              { name: 'Player', value: `<@${discordId}>`, inline: true },
              { name: 'Game', value: achievement.gameName, inline: true },
              { name: 'Achievement', value: achievement.achievementName, inline: false },
              { name: 'Description', value: achievement.achievementDescription, inline: false },
              { name: 'Unlocked', value: new Date(achievement.unlockTime * 1000).toLocaleString(), inline: true }
            ],
            timestamp: new Date(achievement.unlockTime * 1000)
          };
          
          await channel.send({ embeds: [embed] });
        }
      }

      updateUserTrophies(discordId, 'steam', newAchievementData);
    } catch (error) {
      console.error(`Failed to check Steam achievements for ${user.steamId}:`, error.message);
    }
  }
}
