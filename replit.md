# Discord Achievement Tracker Bot

## Overview
A Discord bot that automatically tracks and posts PSN (PlayStation Network) trophies and Steam achievements for server members. The bot runs continuously, checking for new achievements every 30 minutes and posting notifications to a designated Discord channel.

## Current State
The bot is fully implemented with:
- Discord integration via Replit connector
- PSN trophy tracking using psn-api
- Steam achievement tracking using steamapi
- Automated scheduled checks every 30 minutes
- Member registration system with JSON file storage
- Rich embed notifications for new achievements

## Recent Changes (October 18, 2025)
- Initial project setup with Node.js and Discord.js
- Implemented Discord client using Replit Discord integration
- Created storage system for user accounts and trophy/achievement cache
- Built PSN tracker module with authentication and trophy fetching
- Built Steam tracker module with achievement tracking
- Implemented main bot with command handlers and scheduled checks
- Added workflow configuration

## Required Setup

### Environment Secrets Needed:
1. **PSN_NPSSO** - PlayStation Network NPSSO token
   - Get from: https://ca.account.sony.com/api/v1/ssocookie (after logging in)
   
2. **STEAM_API_KEY** - Steam Web API key
   - Get from: https://steamcommunity.com/dev/apikey

3. **DISCORD_CHANNEL_ID** (optional) - Can be set via `!setchannel` command

## Project Architecture

### File Structure
```
├── index.js                 # Entry point
├── src/
│   ├── bot.js              # Main bot logic, commands, scheduled checks
│   ├── discord-client.js   # Discord authentication via Replit integration
│   ├── psn-tracker.js      # PSN API integration and trophy tracking
│   ├── steam-tracker.js    # Steam API integration and achievement tracking
│   └── storage.js          # JSON file-based storage for users and achievements
├── data/                   # Data storage directory (gitignored)
│   ├── users.json         # Discord ID -> PSN/Steam account mappings
│   └── trophies.json      # Cached achievement data per user
└── README.md              # User documentation
```

### Key Components

**Discord Commands:**
- `!register psn:X steam:Y` - Link gaming accounts to Discord user
- `!mystats` - View tracked achievement counts
- `!check` - Manual achievement check (admin)
- `!setchannel` - Set notification channel (admin)
- `!help` - Show help message

**Background Process:**
- Cron job runs every 30 minutes
- Checks all registered users for new trophies/achievements
- Posts rich embeds to notification channel when new items found

**Storage:**
- Simple JSON file storage (no database required)
- Caches all achievements to detect new ones
- Tracks user registrations with PSN/Steam IDs

## User Preferences
- N/A (first session with this project)

## Technical Notes

### API Limitations:
- PSN API requires NPSSO token that may expire (needs manual refresh)
- Steam API requires public profiles
- Both APIs have rate limits (30-minute check interval helps avoid issues)

### Dependencies:
- discord.js v14 - Discord bot framework
- psn-api - PlayStation Network API wrapper
- steamapi - Steam Web API wrapper  
- node-cron - Scheduled task execution
- axios - HTTP client (dependency)

### Discord Integration:
Uses Replit's Discord connector for authentication, which handles:
- OAuth token management
- Token refresh
- Secure credential storage
