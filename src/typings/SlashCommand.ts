import { ExtendedClient } from '../structures/Client';
import {
    SelectMenuInteraction,
    CommandInteraction,
    CommandInteractionOptionResolver,
    PermissionResolvable,
    ChatInputApplicationCommandData,
    GuildMember,
    AnyComponentBuilder,
    ActionRowBuilder,
    AttachmentBuilder,
    ButtonInteraction,
    ModalSubmitInteraction,
    ContextMenuCommandInteraction,
} from 'discord.js';

interface CustomOptions {
    getSubcommand(): string;
    get(name: string, required?: boolean): any;
}

export interface ExtendedInteraction extends CommandInteraction {
    member: GuildMember;
    customId?: string;

    options: CustomOptions & CommandInteractionOptionResolver;

    // configure the type of the options property
    update(options: {
        components: ActionRowBuilder<AnyComponentBuilder>[];
        files: AttachmentBuilder[];
    }): Promise<ExtendedInteraction>;
}

export interface ExtendedSelectMenuInteraction extends SelectMenuInteraction {
    customId: string;
    values: string[];
}

export interface RunOptions {
    client: ExtendedClient;
    interaction:
        | ExtendedInteraction
        | ExtendedSelectMenuInteraction
        | CommandInteraction
        | ButtonInteraction
        | ModalSubmitInteraction
        | ContextMenuCommandInteraction;
    args: CommandInteractionOptionResolver;
}

type RunFunction = (options: RunOptions) => any;

export type CommandType = {
    userPermissions?: PermissionResolvable[];
    run: RunFunction;
} & ChatInputApplicationCommandData;
