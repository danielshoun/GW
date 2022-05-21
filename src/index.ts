import dotenv from 'dotenv';
import { Client, Intents } from 'discord.js';
import { ComponentType, ButtonStyle } from 'discord-api-types/v9';
import { handleSlashCommand } from './commands';

dotenv.config();

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS, 
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_BANS,
        Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
        Intents.FLAGS.GUILD_INTEGRATIONS,
        Intents.FLAGS.GUILD_WEBHOOKS,
        Intents.FLAGS.GUILD_INVITES,
        Intents.FLAGS.GUILD_VOICE_STATES,
        Intents.FLAGS.GUILD_PRESENCES,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_MESSAGE_TYPING,
    ]
});

client.on('ready', () => {
    console.log('Logged in!');
});

client.on('interactionCreate', async (interaction) => {
    if (interaction.isCommand()) {
        handleSlashCommand(client, interaction);
    }
});

client.login(process.env.BOT_TOKEN)