import { RunOptions } from '../typings/SlashCommand';
import { ApplicationCommandType, PermissionResolvable } from 'discord.js';

export class SlashCommand {
    name: string;
    description?: string;
    userPermissions?: PermissionResolvable[];
    run: (options: RunOptions, subcommand?: string) => any;
    subcommands?: SlashCommand[];

    constructor(commandOptions: SlashCommand) {
        Object.assign(this, commandOptions);
        if (this.subcommands) {
            this.subcommands = this.subcommands.map(
                (subcommand) => new SlashCommand(subcommand)
            );
        }
    }
}

export class ContextMenuCommand extends SlashCommand {
    targetType: 'User' | 'Message';

    constructor(commandOptions: Omit<ContextMenuCommand, 'type'>) {
        const type =
            commandOptions.targetType === 'User'
                ? ApplicationCommandType.User
                : ApplicationCommandType.Message;
        super({ ...commandOptions, type } as ContextMenuCommand);
    }
}
