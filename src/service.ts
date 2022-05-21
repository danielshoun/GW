import { BaseCommandInteraction, Client, GuildMemberRoleManager } from "discord.js";

export async function register(client: Client, interaction: BaseCommandInteraction) {
    if (interaction.guild && interaction.member && process.env.REGISTERED_VOTER_ROLE_ID) {
        const registeredVoterRole = await interaction.guild.roles.fetch(process.env.REGISTERED_VOTER_ROLE_ID);
        if (registeredVoterRole) {
            await (interaction.member.roles as GuildMemberRoleManager).add(registeredVoterRole);
            await interaction.reply({ content: 'Thank you for doing your patriotic duty! You will be notified of any future elections.', ephemeral: true });
        }

    } else {
        console.log('Registered voter role ID not set, aborting!');
    }
}