# Discord Video Bot

A Discord bot that can send video messages to specific users via DMs using slash commands.

## Features

- Send videos to users by mentioning them (`/sendvideo`)
- Send videos to users by their Discord ID (`/sendvideobyid`) 
- Include optional messages with the video
- Proper error handling for failed deliveries

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

3. **Configure your bot:**
   - Create a new Discord application at https://discord.com/developers/applications
   - Create a bot user and copy the token
   - Add the token to your `.env` file:
   ```
   DISCORD_TOKEN=your_bot_token_here
   ```

4. **Invite the bot to your server:**
   - Go to OAuth2 > URL Generator in your Discord application
   - Select `bot` and `applications.commands` scopes
   - Select `Send Messages` permission
   - Use the generated URL to invite the bot

5. **Run the bot:**
   ```bash
   npm start
   ```
   
   For development with auto-restart:
   ```bash
   npm run dev
   ```

## Usage

### Commands

#### `/sendvideo`
Send a video to a user by mentioning them.
- `user`: The Discord user to send the video to
- `videourl`: The URL of the video file
- `message`: (Optional) Additional message to include

#### `/sendvideobyid`  
Send a video to a user using their Discord ID.
- `userid`: The Discord user ID (18-digit number)
- `videourl`: The URL of the video file  
- `message`: (Optional) Additional message to include

### Example Usage

```
/sendvideo user:@john videourl:https://example.com/video.mp4 message:Check this out!

/sendvideobyid userid:123456789012345678 videourl:https://example.com/video.mp4
```

## Notes

- The bot will send videos via direct message (DM)
- Users must have DMs enabled from server members to receive videos
- Supported video formats depend on Discord's file upload limits and supported formats
- Video URLs should be direct links to video files or embedded video content

## Requirements

- Node.js 16.9.0 or higher
- Discord.js v14
- A Discord bot token

## Troubleshooting

- **"User not found"**: Check that the user ID is correct
- **"Cannot send messages"**: User has DMs disabled or has blocked the bot
- **Commands not appearing**: Make sure the bot has `applications.commands` scope