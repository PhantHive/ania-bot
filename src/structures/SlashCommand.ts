import {
    CommandType as SlashCommandType,
    RunOptions,
} from '../typings/SlashCommand';

export class SlashCommand {
    name: string;
    description: string;
    run: (options: RunOptions, subcommand?: string) => any;
    subcommands?: SlashCommand[];

    constructor(commandOptions: SlashCommandType) {
        Object.assign(this, commandOptions);
        if (this.subcommands) {
            this.subcommands = this.subcommands.map(
                (subcommand) => new SlashCommand(subcommand)
            );
        }
    }
}
