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
import { promisify } from 'util';

const globPromise = promisify(glob);

export class ExtendedClient extends Client {
    commands: Collection<string, CommandType> = new Collection();

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

    async start() {
        try {
            await this.registerModules();
            await this.login(process.env.BOT_TOKEN);
        } catch (error) {
            console.error('Error starting client:', error);
            throw error;
        }
    }

    async importFiles(filePath: string) {
        try {
            console.log(filePath);
            const file = await import(filePath);
            return file?.default;
        } catch (error) {
            console.error(`Error importing file ${filePath}:`, error);
            return null;
        }
    }

    async registerCommands({ commands, guildId }: RegisterCommandsOptions) {
        try {
            if (guildId) {
                await this.guilds.cache.get(guildId)?.commands.set(commands);
                console.log(`Registered ${commands.length} guild commands`);
            } else {
                await this.application?.commands.set(commands);
                console.log(`Registered ${commands.length} global commands`);
            }
        } catch (error) {
            console.error('Error registering commands:', error);
        }
    }

    async registerModules() {
        try {
            // Commands global
            const slashCommands: ApplicationCommandDataResolvable[] = [];
            const commandFiles = glob.sync(
                `${__dirname}/../SlashCommands/*/*{.ts,.js}`.replace(/\\/g, '/')
            );

            console.log('Loading commands from:', commandFiles);

            for (const filePath of commandFiles) {
                const command: CommandType = await this.importFiles(filePath);
                if (!command?.name) {
                    console.warn(
                        `Skipping command at ${filePath} - invalid command structure`
                    );
                    continue;
                }

                this.commands.set(command.name, command);
                slashCommands.push(command);
                console.log(`Loaded command: ${command.name}`);
            }

            this.once('ready', async () => {
                try {
                    await this.registerCommands({
                        commands: slashCommands,
                        guildId: null,
                    });
                } catch (error) {
                    console.error('Error registering slash commands:', error);
                }
            });

            console.log(`Found ${commandFiles.length} command files`);

            // Events
            const eventFiles = glob.sync(
                `${__dirname}/../events/*/*{.ts,.js}`.replace(/\\/g, '/')
            );

            for (const filePath of eventFiles) {
                const event: Event<keyof ClientEvents> =
                    await this.importFiles(filePath);
                if (!event?.event) {
                    console.warn(
                        `Skipping event at ${filePath} - invalid event structure`
                    );
                    continue;
                }

                this.on(event.event, event.run);
                console.log(`Loaded event: ${event.event}`);
            }

            console.log(`Found ${eventFiles.length} event files`);
        } catch (error) {
            console.error('Error registering modules:', error);
            throw error;
        }
    }
}
