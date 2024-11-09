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
import path, { join } from 'path';
import {
    drawFicheCanvas,
    showFiches,
} from '../../SlashCommands/students/src/archive/archiveSheet';
import data from '../../assets/json/promos.json';
import { addRole, writeRole, removeRoles } from './ipsaRoles/addRoles';
import { showModal } from './emailCheck/showModal';
import { RunOptions } from '../../typings/SlashCommand';
import StudentModel from '../../assets/utils/models/MailSystem';

const MV = StudentModel;
import {
    ActionRowBuilder,
    AttachmentBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    CommandInteraction,
    EmbedBuilder,
    ModalSubmitInteraction,
    StringSelectMenuInteraction,
} from 'discord.js';
import { sendNewPage } from '../../SlashCommands/students/src/archive/userPages';
import { incrementCategoryCounter } from '../../metrics';
import { feedbackTutorial, handleFeedback } from './feedback/ffeFeedback';
import { archiveMenu } from '../../SlashCommands/students/archive';
import { handleVerificationModal } from './emailCheck/handleVerificationModal';

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
            incrementCategoryCounter('mp');
            await showMps(button)
                .then()
                .catch((err) => console.error(err));
        }

        if (button.customId === 'lab') {
            incrementCategoryCounter('lab');
            await showTps(button)
                .then()
                .catch((err) => console.error(err));
        }

        if (button.customId === 'sheet') {
            incrementCategoryCounter('sheet');
            try {
                await showFiches(button);
            } catch (err) {
                console.error(err);
            }
        }

        if (
            button.customId.endsWith('_mp') ||
            button.customId.endsWith('_lab') ||
            button.customId.endsWith('_sheet')
        ) {
            await showTopics(button, button.customId);
        }

        if (button.customId === 'donation') {
            incrementCategoryCounter('donation');
            const imagePath = path.join(
                __dirname,
                '..',
                '..',
                'assets',
                'image',
                'donation',
                'donate-button.webp'
            );
            const attachment = new AttachmentBuilder(imagePath, {
                name: 'donate-button.webp',
            });

            const embed = new EmbedBuilder()
                .setTitle('🌟 Donations 🌟')
                .setImage('attachment://donate-button.webp')
                .setDescription(
                    "✨ Si tu souhaites maintenir en vie l'archive, tu peux avec un don. Chaque geste compte ! ✨"
                )
                .setColor('#FFD700')
                .setFooter({
                    text: 'Merci pour ton soutien !',
                    iconURL: client.user.displayAvatarURL(),
                });

            // Create a button
            const donateButton = new ButtonBuilder()
                .setStyle(ButtonStyle.Link)
                .setLabel('Faire une donation!')
                .setURL(
                    'https://paypal.me/phearion?country.x=FR&locale.x=fr_FR'
                );

            // Create an action row
            const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
                donateButton
            );

            await button.reply({
                embeds: [embed],
                components: [row],
                files: [attachment],
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

            const lastDash = button.customId.lastIndexOf('-');
            const lastUnderscore = button.customId.lastIndexOf('_');
            // use regex to get the topic name before the first "_"
            const topic = button.customId.split('_')[0];
            // use regex to get the category name between the first "_" and the last "-"
            const category = button.customId.split('_')[1].split('-')[0];
            // use regex to get the subject name before the last "_" and after the last "-"
            const subject = button.customId.slice(lastUnderscore + 1, lastDash);

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
            // Redraw the buttons
            let ressource: string;
            data.forEach((promo) => {
                if (promo['id'] === button.guild.id) {
                    ressource = promo['ressources'];
                }
            });

            const category = button.customId.match(/(?<=_)([^_]+?)(?=-)/)[0];
            if (category === 'topic') {
                const field = button.customId.match(/(.+)_/)[1];
                const { buffer, row, row2 } = await drawTopicsCanvas(
                    interaction,
                    'Les modules',
                    field,
                    ressource,
                    newPage
                );
                await sendNewPage(button, buffer, row, row2);
            }

            if (category === 'sheet') {
                const { buffer, row, row2 } = await drawFicheCanvas(
                    interaction,
                    ressource,
                    newPage
                );
                await sendNewPage(button, buffer, row, row2);
            }

            if (category === 'mp') {
                const { buffer, row, row2 } = await drawMpCanvas(
                    interaction,
                    ressource,
                    newPage
                );
                await sendNewPage(button, buffer, row, row2);
            }

            if (category === 'lab') {
                const { buffer, row, row2 } = await drawTpCanvas(
                    interaction,
                    ressource,
                    newPage
                );
                await sendNewPage(button, buffer, row, row2);
            }
        }

        if (button.customId === 'ffe-rate-feedback') {
            await feedbackTutorial(button);
        }

        if (button.customId === 'ffe-rate-feedback-no') {
            await button.update({
                content: 'A bientôt !',
                embeds: [],
                components: [],
            });

            setTimeout(() => {
                button.deleteReply();
            }, 5000);
        }

        if (button.customId === 'archive-home') {
            try {
                await archiveMenu(button);
            } catch (err) {
                console.error(err);
            }
        }
    }

    if (interaction.isModalSubmit()) {
        const modal = interaction as ModalSubmitInteraction;

        if (modal.customId === 'feedback') {
            await handleFeedback(modal);
        } else {
            await handleVerificationModal(modal, client);
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
