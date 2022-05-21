import { BaseCommandInteraction, Client } from "discord.js";
import { register } from "./service";

type Command = {
    name: string;
    run: (client: Client, interaction: BaseCommandInteraction) => Promise<void>;
}

const registerVoter: Command = {
    name: 'register',
    run: register
}

const commands = [registerVoter];

export function handleSlashCommand(client: Client, interaction: BaseCommandInteraction) {
    const command = commands.find(command => command.name === interaction.commandName);
    if (command) {
        command.run(client, interaction);
    } else {
        console.log('Unrecognized command!')
    }
}