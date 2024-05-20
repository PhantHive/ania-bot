import StudentModel from '../../../assets/utils/models/MailSystem';

const MV = StudentModel;
import { Message } from 'discord.js';
import PROMOS from '../../../assets/json/promos.json';

const promoToRole = {
    2028: 'aero1',
    2027: 'aero2',
    2026: 'aero3',
    2025: 'aero4',
    2024: 'aero5',
};

const checkForMissingRoles = async (message: Message, data): Promise<void> => {
    try {
        for (let i = 0; i < PROMOS.length; i++) {
            const guild = message.client.guilds.cache.get(PROMOS[i].id);
            if (guild) {
                const member = await guild.members.fetch(message.author.id);
                if (member) {
                    const role = guild.roles.cache.find((r) =>
                        r.name.includes(promoToRole[data.promo])
                    );
                    if (role) {
                        if (!member.roles.cache.has(role.id)) {
                            try {
                                await member.roles.add(role);
                                await message.reply(
                                    `Je t'ai trouvé dans ce serveur: **${guild.name}** et je t'ai donné le rôle: **${role.name}**`
                                );
                            } catch (error) {
                                await message.reply(
                                    `Je n'ai pas la permission de te donner le rôle: **${role.name}** dans ce serveur: **${guild.name}**\n`
                                );
                            }
                        }
                    } else {
                        await message.reply(
                            `Je n'ai pas trouvé le rôle: **${
                                promoToRole[data.promo]
                            }** dans ce serveur: **${guild.name}**\n` +
                                `Merci de contacter un administrateur pour qu'il ajoute le rôle: **${
                                    promoToRole[data.promo]
                                }**`
                        );
                    }
                }
            }
        }
    } catch (error) {
        await message.reply(
            "**Une erreur est survenue lors de l'auto-check pour tes rôles !**\n" +
                "** La vérification s'effectue dans le channel: <#1047648564236517396>. **"
        );
    }
};

const checkIfDataIsValid = async (message: Message): Promise<void> => {
    // check if user is in the database and have a email different from ''
    const data = await MV.findOne({ discordId: message.author.id });
    if (data) {
        if (data.email !== '') {
            await checkForMissingRoles(message, data);
        } else {
            await message.reply(
                "**Ton compte n'est pas vérifié !**\n" +
                    "** La vérification s'effectue dans le channel: <#1047648564236517396>. **"
            );
        }
    } else {
        await message.reply(
            "**Ton compte n'est pas vérifié !**\n" +
                "** La vérification s'effectue dans le channel: <#1047648564236517396>. **"
        );
    }
};

const autoCheckForRoles = async (message: Message): Promise<void> => {
    try {
        await checkIfDataIsValid(message);
    } catch (error) {
        await message.reply(
            '**Une erreur est survenue !**\n' +
                "** La vérification s'effectue dans le channel: <#1047648564236517396>. **"
        );
    }
};

export { autoCheckForRoles };
