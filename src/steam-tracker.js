import SteamAPI from 'steamapi';

let steamClient = null;

export function initializeSteam(apiKey) {
  steamClient = new SteamAPI(apiKey);
  return steamClient;
}

export async function getSteamAchievements(steamId) {
  if (!steamClient) {
    throw new Error('Steam API not initialized. Please set STEAM_API_KEY.');
  }

  try {
    const games = await steamClient.getUserOwnedGames(steamId);
    const achievementMap = {};

    for (const game of games) {
      if (!game.appID) continue;
      
      try {
        const achievements = await steamClient.getUserAchievements(steamId, game.appID);
        
        if (achievements && achievements.achievements) {
          achievements.achievements.forEach(achievement => {
            if (achievement.achieved === 1) {
              const achievementId = `${game.appID}_${achievement.api}`;
              achievementMap[achievementId] = {
                gameId: game.appID,
                gameName: game.name,
                achievementName: achievement.name,
                achievementDescription: achievement.description || 'No description',
                unlockTime: achievement.unlockTime,
                apiName: achievement.api
              };
            }
          });
        }
      } catch (err) {
        continue;
      }
    }

    return achievementMap;
  } catch (error) {
    console.error('Failed to fetch Steam achievements:', error.message);
    throw error;
  }
}

export function getNewAchievements(oldAchievements, newAchievements) {
  const newItems = [];
  
  for (const [achievementId, achievement] of Object.entries(newAchievements)) {
    if (!oldAchievements[achievementId]) {
      newItems.push(achievement);
    }
  }
  
  return newItems;
}
