require('dotenv').config();
const { REST } = require('@discordjs/rest');
const { Routes, ApplicationCommandOptionType } = require('discord-api-types/v9');

const commands = [
    {
        name: 'register',
        description: 'Register to vote.'
    },
    {
        name: 'nominate',
        description: 'Nominate a person for Idiot King.',
        options: [
            {
                type: ApplicationCommandOptionType.User,
                name: 'user',
                description: 'The user you want to nominate.',
                required: true
            }
        ]
    },
    {
        name: 'election-info',
        description: 'Provides information about Idiot King elections.'
    },
    {
        name: 'snap-election',
        description: 'Start a snap election.'
    },
    {
        name: 'close-snap',
        description: 'Close an ongoing snap election.'
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