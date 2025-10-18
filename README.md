# Discord Achievement Tracker Bot

A Discord bot that automatically tracks PSN trophies and Steam achievements for your server members.

## Features

- 🏆 **PSN Trophy Tracking**: Monitors PlayStation Network trophies
- 🎮 **Steam Achievement Tracking**: Tracks Steam achievements
- 🔔 **Automatic Notifications**: Posts new achievements to Discord channel
- ⏰ **Scheduled Checks**: Checks for new achievements every 30 minutes
- 👥 **Multi-User Support**: Track multiple server members

## Setup Instructions

### 1. Get Your PSN NPSSO Token

1. Sign in at https://www.playstation.com/
2. Visit https://ca.account.sony.com/api/v1/ssocookie
3. Copy your 64-character `npsso` code

### 2. Get Your Steam API Key

1. Visit https://steamcommunity.com/dev/apikey
2. Sign in with your Steam account
3. Register a domain (can use localhost) and get your API key

### 3. Set Environment Secrets

Add these secrets in your Replit project:

- `PSN_NPSSO`: Your PlayStation Network NPSSO token
- `STEAM_API_KEY`: Your Steam Web API key

### 4. Get Your Steam ID

To find your Steam ID (64-bit):
- Visit https://steamid.io/
- Enter your Steam profile URL
- Copy your **steamID64**

## Bot Commands

### User Commands

- `!register psn:YourPSNID steam:YourSteamID64` - Register your gaming accounts
  - Example: `!register psn:MyPSNName steam:76561198012345678`
  - You can register just PSN or just Steam if you prefer
  
- `!mystats` - View your tracked achievements count

- `!help` - Show available commands

### Admin Commands

- `!setchannel` - Set the current channel as the notification channel (where achievements will be posted)

- `!check` - Manually trigger an achievement check for all users

## How It Works

1. Server members register their PSN and/or Steam accounts using `!register`
2. The bot performs an initial sync of all their current achievements
3. Every 30 minutes, the bot checks for new achievements
4. When a member earns a new trophy or achievement, the bot posts it to the notification channel

## Example Notifications

### PSN Trophy
```
🏆 New PSN Trophy!
Player: @Username
Game: God of War
Trophy: First Blood
Description: Defeat your first enemy
Type: Bronze
Earned: 10/18/2025, 3:45 PM
```

### Steam Achievement
```
🎮 New Steam Achievement!
Player: @Username
Game: Portal 2
Achievement: Smash TV
Description: Break 11 test chamber monitors
Unlocked: 10/18/2025, 4:20 PM
```

## Notes

- First registration will sync all existing trophies/achievements (this is normal)
- Only new achievements earned after registration will trigger notifications
- PSN API has rate limits - the bot checks every 30 minutes to avoid issues
- Steam API requires public profiles and game details to be visible
