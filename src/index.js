require('dotenv').config();
const { Client, Intents } = require('discord.js');
const { ComponentType, ButtonStyle } = require('discord-api-types/v9');
const schedule = require('node-schedule');
const electionData = require('../election-data.json');
const fs = require('fs');

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

async function createElection() {
    const guild = await client.guilds.fetch(process.env.GUILD_ID);
    const channel = await guild.channels.fetch(process.env.ELECTIONS_OFFICE_ID);
    const registeredVoterRole = await guild.roles.fetch(process.env.REGISTERED_VOTER_ROLE_ID);
    const nomineeRole = await guild.roles.fetch(process.env.NOMINEE_ROLE_ID);
    const idiotKingRole = await guild.roles.fetch(process.env.IDIOT_KING_ROLE_ID);
    if (nomineeRole.members.size === 0) {
        await channel.send(`No users were nominated for this election cycle. ${idiotKingRole.members.at(0)} retains their title.`)
    } else if (nomineeRole.members.size === 1) {
        if (idiotKingRole.members.size === 1) {
            await idiotKingRole.members.at(0).roles.remove(idiotKingRole);
        }
        await nomineeRole.members.at(0).roles.add(idiotKingRole);
        await nomineeRole.members.at(0).roles.remove(nomineeRole);
        await channel.send(`${idiotKingRole.members.at(0)} was the only Idiot King nominee and automatically won the election.`)
    } else {
        const message = await channel.send({
            content: `${registeredVoterRole} please cast your vote for the next Idiot King. Polls will close Thursday at 5 PM.`,
            components: [
                {
                    type: ComponentType.ActionRow,
                    components: nomineeRole.members.map(member => {
                        return {
                            type: ComponentType.Button,
                            style: ButtonStyle.Primary,
                            label: `${member.displayName}`,
                            custom_id: `${member.id}`
                        }
                    })
                }
            ]
        });
        electionData['electionMessageId'] = message.id;
        await fs.promises.writeFile('election-data.json', JSON.stringify(electionData), 'utf8');
    }
}

schedule.scheduleJob(
    {
        hour: 12,
        minute: 0,
        dayOfWeek: 2,
        dayOfMonth: [1, 2, 3, 4, 5, 6, 7, 15, 16, 17, 18, 19, 20, 21],
    }, createElection
)

async function closeElection() {
    const guild = await client.guilds.fetch(process.env.GUILD_ID);
    const channel = await guild.channels.fetch(process.env.ELECTIONS_OFFICE_ID);
    const registeredVoterRole = await interaction.guild.roles.fetch(process.env.REGISTERED_VOTER_ROLE_ID);
    const nomineeRole = await interaction.guild.roles.fetch(process.env.NOMINEE_ROLE_ID);
    const idiotKingRole = await guild.roles.fetch(process.env.IDIOT_KING_ROLE_ID);
    const electionMessage = await channel.messages.fetch(electionData['electionMessageId']);
    if (nomineeRole.members.size > 1) {
        let currentLeader = nomineeRole.members.at(0).id;
        let currentLeaderVotes = electionData[currentLeader.id] || 0;
        Object.keys(electionData).forEach(key => {
            if (key !== 'electionMessageId') {
                if (electionData[key] > currentLeaderVotes) {
                    currentLeader = key;
                    currentLeaderVotes = electionData[key];
                }
            }
        });
        const electionWinner = guild.members.fetch(currentLeader);
        await idiotKingRole.members.at(0).roles.remove(idiotKingRole);
        await electionWinner.roles.add(idiotKingRole);
        await channel.send(`Congratulations to ${electionWinner} for being elected Idiot King!`)
        await electionMessage.edit('This election has concluded.');
        electionData = {};
        await fs.promises.writeFile('election-data.json', JSON.stringify(electionData), 'utf8');
    }
    nomineeRole.members.forEach(async member => {
        await member.roles.remove(nomineeRole);
    });
}

schedule.scheduleJob(
    {
        hour: 5,
        minute: 0,
        dayOfWeek: 4,
        dayOfMonth: [1, 2, 3, 4, 5, 6, 7, 15, 16, 17, 18, 19, 20, 21],   
    }, closeElection
)

client.on('interactionCreate', async interaction => {
    if (interaction.commandName === 'register') {
        const registeredVoterRole = await interaction.guild.roles.fetch(process.env.REGISTERED_VOTER_ROLE_ID);
        await interaction.member.roles.add(registeredVoterRole);
        await interaction.reply('Thank you for doing your patriotic duty! You will be notified of any future elections.');
    }

    if (interaction.commandName === 'nominate') {
        const nomineeRole = await interaction.guild.roles.fetch(process.env.NOMINEE_ROLE_ID);
        const user = interaction.options.get('user').member;
        await user.roles.add(nomineeRole);
        await interaction.reply(`Nominated ${user} for the next Idiot King election.`);
    }

    if (interaction.commandName === 'snap-election') {
        await interaction.reply('Starting a snap election...');
        await createElection();
    }

    if (interaction.commandName === 'close-snap') {
        await interaction.reply('Closing most recent snap election...');
        await closeElection();
    }

    if (interaction.commandName === 'election-info') {
        await interaction.reply({
            content: `
Idiot King elections are held every two weeks. If only one person is nominated,
that person will automatically win the election. If no one is nominated, the previous
Idiot King will retain their role for another two weeks. Being Idiot King provides the following
benefits:
- Ability to change anyone else's nickname.
- Ability to timeout other users.
- Ability to delete other user's messages.
- Ability to server mute, deafen, and move other users in voice chat.`,
            ephemeral: true
        });
    }

    if (interaction.isButton()) {
        if(electionData[interaction.customId]) {
            electionData[interaction.customId] += 1;
            await fs.promises.writeFile('election-data.json', JSON.stringify(electionData), 'utf8');
            await interaction.reply({ content: 'Your vote has been recorded.', ephemeral: true });
        } else {
            electionData[interaction.customId] = 1;
            await fs.promises.writeFile('election-data.json', JSON.stringify(electionData), 'utf8');
            await interaction.reply({ content: 'Your vote has been recorded.', ephemeral: true });
        }
    }
});

client.login(process.env.BOT_TOKEN)