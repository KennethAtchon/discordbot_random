const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes, AttachmentBuilder } = require('discord.js');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.DirectMessages
    ]
});

// Store active intervals for harassment functionality
const activeIntervals = new Map();

// Slash command for sending video to user
const commands = [
    new SlashCommandBuilder()
        .setName('sendvideo')
        .setDescription('Send a video message to the specified user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to send the video to')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('videourl')
                .setDescription('The URL of the video to send')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Optional message to include with the video')
                .setRequired(false)),
    
    new SlashCommandBuilder()
        .setName('sendvideobyid')
        .setDescription('Send a video message to a user by their ID')
        .addStringOption(option =>
            option.setName('userid')
                .setDescription('The Discord user ID to send the video to')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('videourl')
                .setDescription('The URL of the video to send')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Optional message to include with the video')
                .setRequired(false)),
    
    new SlashCommandBuilder()
        .setName('harassme')
        .setDescription('Start receiving periodic video messages'),
        
    new SlashCommandBuilder()
        .setName('stopharassment')
        .setDescription('Stop receiving periodic video messages')
];

client.once('ready', async () => {
    console.log(`✅ Bot is ready! Logged in as ${client.user.tag}`);
    
    // Register slash commands
    const rest = new REST().setToken(process.env.DISCORD_TOKEN);
    
    try {
        console.log('🔄 Started refreshing application (/) commands.');
        
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands }
        );

        console.log('✅ Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error('❌ Error registering commands:', error);
    }
});

async function sendVideoToAnyoneInBackground(userId){
    const fourHours = 4 * 60 * 60 * 1000;
    const targetUser = await client.users.fetch(userId);
    
    // Clear any existing interval for this user
    if (activeIntervals.has(userId)) {
        clearInterval(activeIntervals.get(userId));
    }
    
    const intervalId = setInterval(async () => {
        try {
            const dmChannel = await targetUser.createDM();
            const content = "4 Hourly reminder to grind";
            const videoUrl = "./sadness.mp4"; 
            const attachment = new AttachmentBuilder(videoUrl);
            await dmChannel.send({ content, files: [attachment] });
        } catch (error) {
            console.error(`Error sending harassment message to ${userId}:`, error);
        }
    }, fourHours);
    
    // Store the interval ID so we can stop it later
    activeIntervals.set(userId, intervalId);
}

function stopHarassment(userId) {
    if (activeIntervals.has(userId)) {
        clearInterval(activeIntervals.get(userId));
        activeIntervals.delete(userId);
        return true;
    }
    return false;
}

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'sendvideo') {
        const targetUser = interaction.options.getUser('user');
        const videoUrl = interaction.options.getString('videourl');
        const message = interaction.options.getString('message') || '';

        try {
            await interaction.deferReply({ ephemeral: true });
            
            const dmChannel = await targetUser.createDM();
            const content = message ? `${message}\n${videoUrl}` : videoUrl;
            
            await dmChannel.send(content);
            
            await interaction.editReply({
                content: `✅ Video sent successfully to ${targetUser.tag}!`,
                ephemeral: true
            });
        } catch (error) {
            console.error('Error sending video:', error);
            await interaction.editReply({
                content: '❌ Failed to send video. Make sure the user allows DMs from server members.',
                ephemeral: true
            });
        }
    }

    if (commandName === 'sendvideobyid') {
        const userId = interaction.options.getString('userid');
        const videoUrl = interaction.options.getString('videourl');
        const message = interaction.options.getString('message') || '';

        try {
            await interaction.deferReply({ ephemeral: true });
            
            const targetUser = await client.users.fetch(userId);
            const dmChannel = await targetUser.createDM();
            const content = message ? `${message}\n${videoUrl}` : videoUrl;
            
            await dmChannel.send(content);
            
            await interaction.editReply({
                content: `✅ Video sent successfully to ${targetUser.tag} (ID: ${userId})!`,
                ephemeral: true
            });
        } catch (error) {
            console.error('Error sending video:', error);
            
            if (error.code === 10013) {
                await interaction.editReply({
                    content: '❌ User not found. Please check the user ID.',
                    ephemeral: true
                });
            } else if (error.code === 50007) {
                await interaction.editReply({
                    content: '❌ Cannot send messages to this user. They may have DMs disabled.',
                    ephemeral: true
                });
            } else {
                await interaction.editReply({
                    content: '❌ Failed to send video. Please try again later.',
                    ephemeral: true
                });
            }
        }
    }

    if (commandName === 'harassme') {
        const myuserId = interaction.user.id;
        try {
            await interaction.deferReply({ ephemeral: true });
            await sendVideoToAnyoneInBackground(myuserId);
            await interaction.editReply({ content: '✅ Started sending periodic reminders to you!', ephemeral: true });
        } catch (error) {
            console.error('Error starting harassment:', error);
            await interaction.editReply({ content: '❌ Failed to start periodic messages.', ephemeral: true });
        }
    }

    if(commandName === 'stopharassment') {
        const myuserId = interaction.user.id;
        const stopped = stopHarassment(myuserId);
        await interaction.reply({ 
            content: stopped ? '✅ Stopped periodic messages!' : '❌ No active periodic messages found.', 
            ephemeral: true 
        });
    }
});

// Error handling
client.on('error', error => {
    console.error('Discord client error:', error);
});

process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});

// Login to Discord
client.login(process.env.DISCORD_TOKEN);