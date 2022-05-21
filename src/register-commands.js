require('dotenv').config();
const { REST } = require('@discordjs/rest');
const { Routes, ApplicationCommandOptionType } = require('discord-api-types/v9');

const commands = [
    {
        name: 'register',
        description: 'Register to vote.'
    }
];

const rest = new REST({ version: '9' }).setToken(process.env.BOT_TOKEN);

(async () => {
    try {
        console.log ('Started refreshing slash commands.');

        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands }
        );

        console.log('Successfully reloaded slash commands.');
    } catch (error) {
        console.error(error);
    }
})();