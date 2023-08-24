import { client } from '../../index';
import { Event } from '../../structures/Event';
import { showMps } from '../../SlashCommands/students/src/archive/archiveMp';
import { showTps } from '../../SlashCommands/students/src/archive/archiveTp';
import { showTopics } from '../../SlashCommands/students/src/archive/archiveTopics';
import { getFiles } from '../../SlashCommands/students/src/archive/ffe';
import { readdirSync } from 'fs';
import { join } from 'path';
import { showFiches } from '../../SlashCommands/students/src/archive/archiveFiches';
import data from '../../assets/json/promos.json';
import { addRole, writeRole, removeRoles } from './ipsaRoles/addRoles';
import { showModal } from './emailCheck/showModal';
import { verification } from './emailCheck/checkMail';
import { RunOptions } from '../../typings/SlashCommand';
import MV from '../../typings/MongoTypes';
import {
    ButtonInteraction,
    ModalSubmitInteraction,
    StringSelectMenuInteraction,
} from 'discord.js';

export default new Event('interactionCreate', async (interaction) => {
    if (interaction.isStringSelectMenu()) {
        const menu = interaction as StringSelectMenuInteraction;

        let user = menu.user.id;

        try {
            if (menu.customId === 'assos-tech') {
                // get asso label
                let asso = menu.values;
                await menu.deferUpdate();
                await writeRole(user, asso, 'Tech');
            }

            if (menu.customId === 'assos-sport') {
                // get asso label
                let asso = menu.values;
                await menu.deferUpdate();
                await writeRole(user, asso, 'Sport');
            }

            if (menu.customId === 'assos-art') {
                // get asso label
                let asso = menu.values;
                console.log('Choosed asso: ' + asso);
                await menu.deferUpdate();
                await writeRole(user, asso, 'Art');
            }

            if (menu.customId === 'promotion') {
                // get promo label
                let promo = menu.values;
                console.log('Choosed promo: ' + promo);
                await menu.deferUpdate();
                await writeRole(user, promo, 'promo');
            }
        } catch (error) {
            // make a small error report
            console.log('\n-----------------------------------');
            console.log('Event: interactionCreate.ts\nError: ' + error);
            console.log('-----------------------------------\n');
        }
    }

    if (interaction.isButton()) {
        const button = interaction as ButtonInteraction;

        // ===============
        // IPSA EMAIL SYSTEM
        // ===============
        if (button.customId === 'open-email-modal') {
            // show modal using showModal.ts
            await showModal(interaction);
        }

        // ===============
        // IPSA ROLES SYSTEM
        // ===============
        if (button.customId === 'ipsa-roles') {
            // check if userRole.json contains user id
            let user = button.user.id;
            await button.deferReply({ ephemeral: true });
            const studentData = await MV.findOne({ discordId: user });

            if (!studentData) {
                await button.editReply({
                    content: "Vous n'avez pas encore vérifier votre email.",
                });
            } else {
                // check if one of the asso is not set and if it is, send a message to the user to select in the specific menu
                if (studentData['assoTech'].length === 0) {
                    let msg = "Pas d'association tech à supprimer.";
                    await button.editReply({
                        content: msg,
                    });
                }
                if (studentData['assoSport'].length === 0) {
                    let msg = "Pas d'association sport à supprimer.";
                    await button.editReply({
                        content: msg,
                    });
                }
                if (studentData['assoArt'].length === 0) {
                    let msg = "Pas d'association art à supprimer.";
                    await button.editReply({
                        content: msg,
                    });
                }
                if (studentData['promo'] === 1) {
                    let msg = 'Pas de promotion à supprimer.';
                    await button.editReply({
                        content: msg,
                    });
                }
                try {
                    const res: string = await removeRoles(button, user);
                    await button.editReply({
                        content: res,
                    });
                } catch (error) {
                    await button.editReply({
                        content: "You don' have any roles to be removed :)",
                    });
                }

                try {
                    const res: string = await addRole(button, user);

                    await button.followUp({
                        content: res,
                        ephemeral: true,
                    });
                } catch (err) {
                    await button.followUp({
                        content: err.message,
                        ephemeral: true,
                    });
                }
            }
        }
        // ===============

        // ===============
        // ARCHIVE SYSTEM
        // ===============
        if (button.customId === 'mp') {
            await showMps(button)
                .then()
                .catch((err) => console.error(err));
        }

        if (button.customId === 'tp') {
            await showTps(button)
                .then()
                .catch((err) => console.error(err));
        }

        if (button.customId === 'sheets') {
            try {
                await showFiches(button);
            } catch (err) {
                console.error(err);
            }
        }

        if (
            button.customId.endsWith('-mp') ||
            button.customId.endsWith('-tp') ||
            button.customId.endsWith('-fiche')
        ) {
            await showTopics(button, button.customId);
        }

        if (button.customId === 'send_files') {
            await button.reply({
                content:
                    "Cette option sera mise en développement et disponible dès que l'IPSA accordera un budget à Discord." +
                    'Nous utiliserons GCS.',
                ephemeral: true,
            });
        }

        if (button.customId.endsWith('-topics')) {
            let ressource: string;
            data.forEach((promo) => {
                if (promo['id'] === button.guild.id) {
                    ressource = promo['ressources'];
                }
            });
            console.log(button.customId);
            let topic = button.customId.split('-')[0];
            let category = button.customId.split('-')[1];
            let subject = button.customId.split('-')[2];
            const folder = join(
                __dirname,
                '..',
                '..',
                'assets',
                ressource,
                `${topic}`,
                `${category}`,
                `${subject}`
            );

            try {
                await getFiles(interaction, folder);
            } catch (err) {
                console.log(err);
            }
        }
        // ===============
    }

    if (interaction.isModalSubmit()) {
        const modal = interaction as ModalSubmitInteraction;

        // ===============
        // IPSA EMAIL SYSTEM
        // ===============
        if (modal.customId === 'verification') {
            await modal.deferReply({ ephemeral: true });
            // check email using class Verif in checkMail.ts
            let email = modal.fields.getTextInputValue('email');
            const verif = new verification(email, modal, client);
            const isVerified = await verif.startVerif();
            await modal.editReply({
                content: isVerified,
            });
        }
    }

    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    await command.run({
        args: interaction.options,
        client,
        interaction,
    } as RunOptions);
});
