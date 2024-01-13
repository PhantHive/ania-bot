import { client } from '../../index';
import { Event } from '../../structures/Event';
import {
    drawMpCanvas,
    showMps,
} from '../../SlashCommands/students/src/archive/archiveMp';
import {
    drawTpCanvas,
    showTps,
} from '../../SlashCommands/students/src/archive/archiveLab';
import {
    drawTopicsCanvas,
    showTopics,
} from '../../SlashCommands/students/src/archive/archiveTopics';
import { getFiles } from '../../SlashCommands/students/src/archive/ffe';
import { join } from 'path';
import {
    drawFicheCanvas,
    showFiches,
} from '../../SlashCommands/students/src/archive/archiveSheet';
import data from '../../assets/json/promos.json';
import { addRole, writeRole, removeRoles } from './ipsaRoles/addRoles';
import { showModal } from './emailCheck/showModal';
import { verification } from './emailCheck/checkMail';
import { RunOptions } from '../../typings/SlashCommand';
import MV from '../../typings/MongoTypes';
import {
    ButtonInteraction,
    CommandInteraction,
    ModalSubmitInteraction,
    StringSelectMenuInteraction,
    TextChannel,
} from 'discord.js';
import { sendNewPage } from '../../SlashCommands/students/src/archive/userPages';

export default new Event('interactionCreate', async (interaction) => {
    if (!interaction.inGuild()) {
        return await (interaction as CommandInteraction).reply({
            content: 'This command is only available in a guild.',
        });
    }

    if (interaction.isStringSelectMenu()) {
        const menu = interaction as StringSelectMenuInteraction;

        const user = menu.user.id;

        try {
            if (menu.customId === 'assos-tech') {
                // get asso label
                const asso = menu.values;
                await menu.deferUpdate();
                await writeRole(user, asso, 'Tech');
            }

            if (menu.customId === 'assos-sport') {
                // get asso label
                const asso = menu.values;
                await menu.deferUpdate();
                await writeRole(user, asso, 'Sport');
            }

            if (menu.customId === 'assos-art') {
                // get asso label
                const asso = menu.values;
                console.log('Choosed asso: ' + asso);
                await menu.deferUpdate();
                await writeRole(user, asso, 'Art');
            }

            if (menu.customId === 'promotion') {
                // get promo label
                const promo = menu.values;
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
            const user = button.user.id;
            await button.deferReply({ ephemeral: true });
            const studentData = await MV.findOne({ discordId: user });

            if (!studentData) {
                await button.editReply({
                    content: "Vous n'avez pas encore vérifier votre email.",
                });
            } else {
                // check if one of the asso is not set and if it is, send a message to the user to select in the specific menu
                if (studentData['assoTech'].length === 0) {
                    const msg = "Pas d'association tech à supprimer.";
                    await button.editReply({
                        content: msg,
                    });
                }
                if (studentData['assoSport'].length === 0) {
                    const msg = "Pas d'association sport à supprimer.";
                    await button.editReply({
                        content: msg,
                    });
                }
                if (studentData['assoArt'].length === 0) {
                    const msg = "Pas d'association art à supprimer.";
                    await button.editReply({
                        content: msg,
                    });
                }
                if (studentData['promo'] === 1) {
                    const msg = 'Pas de promotion à supprimer.';
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

        if (button.customId === 'lab') {
            await showTps(button)
                .then()
                .catch((err) => console.error(err));
        }

        if (button.customId === 'sheet') {
            try {
                await showFiches(button);
            } catch (err) {
                console.error(err);
            }
        }

        if (
            button.customId.endsWith('-mp') ||
            button.customId.endsWith('-lab') ||
            button.customId.endsWith('-sheet')
        ) {
            await showTopics(button, button.customId);
        }

        if (button.customId === 'bigbrain') {
            await button.reply({
                content: 'A venir.',
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
            const topic = button.customId.split('-')[0];
            const category = button.customId.split('-')[1];
            const subject = button.customId.split('-')[2];

            // 'fr' should be changed in the future!! to be adapted to server automatically.
            const folder = join(
                __dirname,
                '..',
                '..',
                'assets',
                ressource,
                `${topic}`,
                `${category}`,
                `${subject}`,
                'fr'
            );

            try {
                await getFiles(interaction, folder);
            } catch (err) {
                console.log(err);
            }
        }

        if (
            button.customId.includes('-previous') ||
            button.customId.includes('-next')
        ) {
            // get number of page it's after the last "-"
            const currentPage = Number(button.customId.split('-').pop());
            // get if the string contains "previous" or "next" regex
            const action = button.customId.match(/previous|next/)[0];

            const newPage: number =
                action === 'previous' ? currentPage - 1 : currentPage + 1;

            console.log('newPage: ' + newPage);
            console.log(action);

            // Redraw the buttons
            let ressource: string;
            data.forEach((promo) => {
                if (promo['id'] === button.guild.id) {
                    ressource = promo['ressources'];
                }
            });

            // topic is between "_" and "-" in the string
            const topic = button.customId.split('_')[1].split('-')[0];
            if (topic === 'topic') {
                const field = button.customId.split('_')[0];
                console.log('category: ' + field);
                const { buffer, row, row2 } = await drawTopicsCanvas(
                    interaction,
                    'Les modules',
                    field,
                    ressource,
                    newPage
                );
                console.log('row: ' + row);
                await sendNewPage(button, buffer, row, row2);
            }

            if (topic === 'sheet') {
                const { buffer, row, row2 } = await drawFicheCanvas(
                    interaction,
                    ressource,
                    newPage
                );
                await sendNewPage(button, buffer, row, row2);
            }

            if (topic === 'mp') {
                const { buffer, row, row2 } = await drawMpCanvas(
                    interaction,
                    ressource,
                    newPage
                );
                await sendNewPage(button, buffer, row, row2);
            }

            if (topic === 'lab') {
                const { buffer, row, row2 } = await drawTpCanvas(
                    interaction,
                    ressource,
                    newPage
                );
                await sendNewPage(button, buffer, row, row2);
            }
        }

        if (button.customId === 'ffe-rate-happy') {
            await button.deferUpdate();
            // send to the channel 1189276341011501197 of the guild 502931781012684818 "+1"
            try {
                const guild = client.guilds.cache.get('502931781012684818');
                const channel = guild.channels.cache.get('1189276341011501197');
                await (channel as TextChannel).send('+1');
            } catch {}

            try {
                await button.deleteReply();
            } catch {}
        }

        if (button.customId === 'ffe-rate-unhappy') {
            await button.deferUpdate();
            try {
                const guild = client.guilds.cache.get('502931781012684818');
                const channel = guild.channels.cache.get('1189276381297786920');
                await (channel as TextChannel).send('-1');
            } catch {}

            try {
                await button.deleteReply();
            } catch {}
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
            const email = modal.fields.getTextInputValue('email');
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
