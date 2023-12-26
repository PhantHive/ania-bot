import { ButtonInteraction, GuildMember, Role } from 'discord.js';
import MV from '../../../typings/MongoTypes';
import { Mutex } from 'async-mutex';
const writeMutex = new Mutex();
import { debounce } from 'lodash';
import { assoTech, assoSport, assoArt, menuPromo } from './rolesParameter';

const debouncedWrite = debounce(
    async (user: string, roles: (string | number)[], type: string) => {
        const release = await writeMutex.acquire();
        try {
            const filter = { discordId: user };

            if (type === 'promo') {
                await MV.updateOne(filter, {
                    promo: roles[0],
                });
            } else {
                const update = {};

                if (type === 'Tech') {
                    if (roles.includes('no-tech')) {
                        update['assoTech'] = ['no-tech'];
                    } else {
                        update['$set'] = { assoTech: roles };
                    }
                }
                if (type === 'Sport') {
                    if (roles.includes('no-sport')) {
                        update['assoSport'] = ['no-sport'];
                    } else {
                        update['$set'] = { assoSport: roles };
                    }
                }
                if (type === 'Art') {
                    if (roles.includes('no-art')) {
                        update['assoArt'] = ['no-art'];
                    } else {
                        update['$set'] = { assoArt: roles };
                    }
                }

                await MV.updateOne(filter, update);
            }
        } finally {
            release();
        }
    },
    200
);

const writeRole = async (
    user: string,
    roles: (string | number)[],
    type: string
) => {
    return debouncedWrite(user, roles, type);
};

const addRole = async (
    interaction: ButtonInteraction,
    user: string
): Promise<string> => {
    return new Promise(async (resolve, reject) => {
        // add the role to the user
        const member: GuildMember = interaction.guild.members.cache.find(
            (member) => member.id === user
        );
        // check if Student exists
        const studentData = await MV.findOne({ discordId: user });
        const roles = member.roles.cache.map(
            (role: Role) => `<:${role.name}:${role.id}>`
        );
        if (!studentData)
            return reject(
                `Erreur lors de la tentative d'accès à la DB. Vérifier votre email d'abord.`
            );

        const roleInstance = {
            assoTech: studentData.assoTech ? studentData.assoTech : [],
            assoSport: studentData.assoSport ? studentData.assoSport : [],
            assoArt: studentData.assoArt ? studentData.assoArt : [],
            promo: studentData.promo ? studentData.promo : 1,
        };

        // the goal is to add the roles in role instances by keeping only the roles that are in the lists
        // only keep roles that are in the lists
        let rolesFiltered: string[] = [];

        // filter out any role that is not in the lists using roleInstance
        assoTech.forEach((role) => {
            const roleName = role
                .match(/:(.*)>/)
                .pop()
                .split(':')[0];
            if (roleInstance['assoTech'].includes(roleName.toLowerCase())) {
                rolesFiltered.push(role);
            }
        });
        assoSport.forEach((role) => {
            const roleName = role
                .match(/:(.*)>/)
                .pop()
                .split(':')[0];
            if (roleInstance['assoSport'].includes(roleName.toLowerCase())) {
                rolesFiltered.push(role);
            }
        });
        assoArt.forEach((role) => {
            const roleName = role
                .match(/:(.*)>/)
                .pop()
                .split(':')[0];
            if (roleInstance['assoArt'].includes(roleName.toLowerCase())) {
                rolesFiltered.push(role);
            }
        });
        menuPromo.forEach((role) => {
            const roleName = role
                .match(/:(.*)>/)
                .pop()
                .split(':')[0];
            if (roleInstance['promo'] === parseInt(roleName)) {
                rolesFiltered.push(role);
            }
        });

        // filter out any role that user already have
        rolesFiltered = rolesFiltered.filter((role) => {
            const roleName = role
                .match(/:(.*)>/)
                .pop()
                .split(':')[0];
            return !roles.some((role) => role.includes(roleName));
        });

        if (rolesFiltered.length === 0) {
            resolve(`📗 Assos/Promo ajoutés: Aucun rôle à ajouter.`);
        }

        let extraInfo: string = '';
        // send a message to the user with the roles added
        rolesFiltered.forEach((role) => {
            const roleName: string = role
                .match(/:(.*)>/)
                .pop()
                .split(':')[0];
            try {
                // fetch role by name and add it to the user
                const role = interaction.guild.roles.cache.find(
                    (role) => role.name.toLowerCase() === roleName.toLowerCase()
                );
                if (role) {
                    member.roles.add(role);
                } else {
                    extraInfo += `Le rôle **${roleName}** n'existe pas/plus. Contactez un administrateur.\n`;
                }
            } catch (e) {}
        });

        resolve(
            `📗 Assos / Promo ajoutés: **${rolesFiltered.join(
                '    '
            )}** \n${extraInfo}`
        );
    });
};

const removeRoles = async (
    interaction: ButtonInteraction,
    user: string
): Promise<string> => {
    return new Promise(async (resolve, reject) => {
        // remove the role to the user that match with the lists above
        // check all roles that a user have
        const member: GuildMember = interaction.guild.members.cache.find(
            (member: GuildMember) => member.id === user
        );
        // let roles where you map role to  <:${role.name}:${role.id}> except if the role doesn't exist anymore
        const roles = member.roles.cache.map(
            (role: Role) => `<:${role.name}:${role.id}>`
        );

        const studentData = await MV.findOne({ discordId: user });
        if (!studentData)
            return reject(
                `Erreur lors de la tentative de suppression des rôles. Veuillez contactez un administrateur.`
            );

        const roleInstance = {
            assoTech: studentData.assoTech ? studentData.assoTech : [],
            assoSport: studentData.assoSport ? studentData.assoSport : [],
            assoArt: studentData.assoArt ? studentData.assoArt : [],
            promo: studentData.promo ? studentData.promo : 1,
        };

        // only keep roles that are in the lists
        let rolesFiltered: string[] = [];

        assoTech.forEach((role) => {
            const roleName = role
                .match(/:(.*)>/)
                .pop()
                .split(':')[0];
            if (!roleInstance['assoTech'].includes(roleName.toLowerCase())) {
                rolesFiltered.push(role);
            }
        });
        assoSport.forEach((role) => {
            const roleName = role
                .match(/:(.*)>/)
                .pop()
                .split(':')[0];
            if (!roleInstance['assoSport'].includes(roleName.toLowerCase())) {
                rolesFiltered.push(role);
            }
        });
        assoArt.forEach((role) => {
            const roleName = role
                .match(/:(.*)>/)
                .pop()
                .split(':')[0];
            if (!roleInstance['assoArt'].includes(roleName.toLowerCase())) {
                rolesFiltered.push(role);
            }
        });
        menuPromo.forEach((role) => {
            const roleName = role
                .match(/:(.*)>/)
                .pop()
                .split(':')[0];
            if (roleInstance['promo'] !== parseInt(roleName)) {
                rolesFiltered.push(role);
            }
        });

        // filter only roles that user have
        rolesFiltered = rolesFiltered.filter((role) => {
            const roleName = role
                .match(/:(.*)>/)
                .pop()
                .split(':')[0];
            return roles.some((role) => role.includes(roleName));
        });

        await studentData.save();

        // remove the role from the user

        if (rolesFiltered.length === 0) {
            resolve(`📕 Assos/Promo retirés: Aucun rôle à retirer.`);
        }

        rolesFiltered.forEach((role) => {
            const roleName = role
                .match(/:(.*)>/)
                .pop()
                .split(':')[0];
            try {
                const role: Role = interaction.guild.roles.cache.find(
                    (role: Role) =>
                        role.name.toLowerCase() === roleName.toLowerCase()
                );
                member.roles.remove(role);
            } catch (e) {}
        });

        resolve(`📕 Assos/Promo retirés: **${rolesFiltered.join('   ')}**`);
    });
};

export { writeRole, addRole, removeRoles };
