// @ts-ignore
import {
    ApplicationCommandDataResolvable,
    Client,
    Collection,
    ClientEvents,
    Partials,
} from 'discord.js';
import { CommandType } from '../typings/SlashCommand';
import glob from 'glob';
import { RegisterCommandsOptions } from '../typings/client';
import { Event } from './Event';
import * as superagent from 'superagent';

export class ExtendedClient extends Client {
    commands: Collection<string, CommandType> = new Collection();
    lastMessageTimestamp: number;
    static superagent: typeof superagent;

    constructor() {
        super({
            intents: [
                'Guilds',
                'GuildMessages',
                'GuildMembers',
                'GuildMessageReactions',
                'MessageContent',
                'DirectMessages',
                'GuildVoiceStates',
                'DirectMessageTyping',
                'GuildPresences',
                'GuildIntegrations',
            ],
            partials: [
                Partials.Message,
                Partials.Channel,
                Partials.User,
                Partials.GuildMember,
            ],
        });
    }

    start() {
        this.registerModules();
        this.login(process.env.BOT_TOKEN);
    }

    async importFiles(filePath: string) {
        console.log(filePath);
        const file = await import(filePath);
        return file?.default;
    }

    async registerCommands({ commands, guildId }: RegisterCommandsOptions) {
        if (guildId) {
            await this.guilds.cache.get(guildId)?.commands.set(commands);
        } else {
            await this.application?.commands.set(commands);
        }
    }

    async registerModules() {
        // Commands global
        const slashCommands: ApplicationCommandDataResolvable[] = [];
        const commandFiles: string[] = glob.sync(
            `${__dirname}/../SlashCommands/*/*{.ts,.js}`.replace(/\\/g, '/')
        );

        let c = 1;
        for (const filePath of commandFiles) {
            const command: CommandType = await this.importFiles(filePath);
            if (!command.name) continue;
            this.commands.set(command.name, command);
            slashCommands.push(command);
            c++;
        }
        this.on('ready', () => {
            this.registerCommands({
                commands: slashCommands,
                guildId: null,
            });
        });

        console.log('Global commands: ', commandFiles);

        // Event
        const eventFiles = glob.sync(
            `${__dirname}/../events/*/*{.ts,.js}`.replace(/\\/g, '/')
        );
        c = 1;
        for (const filePath of eventFiles) {
            const event: Event<keyof ClientEvents> =
                await this.importFiles(filePath);
            this.on(event.event, event.run);
            c++;
        }
    }
}
