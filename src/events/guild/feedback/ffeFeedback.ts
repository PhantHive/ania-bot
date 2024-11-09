import {
    ActionRowBuilder,
    AttachmentBuilder,
    ButtonInteraction,
    CommandInteraction,
    ContextMenuCommandInteraction,
    EmbedBuilder,
    ModalBuilder,
    ModalSubmitInteraction,
    TextChannel,
    TextInputBuilder,
    TextInputStyle,
} from 'discord.js';
import { client } from '../../../index';
import {
    ExtendedInteraction,
    ExtendedSelectMenuInteraction,
} from '../../../typings/SlashCommand';
import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import axios from 'axios';

export const openFeedback = async (
    interaction:
        | ExtendedInteraction
        | ExtendedSelectMenuInteraction
        | CommandInteraction
        | ButtonInteraction
        | ModalSubmitInteraction
        | ContextMenuCommandInteraction
) => {
    const modal = new ModalBuilder()
        .setCustomId('feedback')
        .setTitle(`Formulaire de feedback pour ${interaction.user.username}`);

    // Add components to modal

    // Create the text input components
    const utilityInput = new TextInputBuilder()
        .setCustomId('utilityInput')
        .setLabel("Note l'archive (1: pas top à 10: très utile)")
        .setStyle(TextInputStyle.Short);

    const usageInput = new TextInputBuilder()
        .setCustomId('usageInput')
        .setLabel('Ton principal usage ? (MP, TP ou Fiches)')
        .setStyle(TextInputStyle.Short);

    const improvementInput = new TextInputBuilder()
        .setCustomId('improvementInput')
        .setLabel("Comment puis-je m'améliorer ? (optionnel)")
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(false);

    // An action row only holds one text input,
    // so you need one action row per text input.
    const firstActionRow =
        new ActionRowBuilder<TextInputBuilder>().addComponents(utilityInput);
    const secondActionRow =
        new ActionRowBuilder<TextInputBuilder>().addComponents(usageInput);
    const thirdActionRow =
        new ActionRowBuilder<TextInputBuilder>().addComponents(
            improvementInput
        );

    // Add inputs to the modal
    modal.addComponents(firstActionRow, secondActionRow, thirdActionRow);

    // Send the modal
    if ('showModal' in interaction) {
        await interaction.showModal(modal);
    }
};

export const handleFeedback = async (interaction: ModalSubmitInteraction) => {
    await interaction.deferReply({ ephemeral: true });

    // Collect the values from the interaction
    const utilityInput = interaction.fields.getTextInputValue(
        'utilityInput'
    ) as string;
    const usageInput = interaction.fields.getTextInputValue(
        'usageInput'
    ) as string;
    const improvementInput = interaction.fields.getTextInputValue(
        'improvementInput'
    ) as string;
    const discordName = interaction.user.username;
    const discordId = interaction.user.id;
    const logoPath = path.resolve(
        __dirname,
        '../../../assets/image/logo/lucky-feedback.png'
    );
    const logoBase64 = fs.readFileSync(logoPath).toString('base64');
    const currentDate = new Date();
    const dateString = `${currentDate.getDate()}-${currentDate.getMonth() + 1}-${currentDate.getFullYear()}`;
    const avatarUrl = interaction.user.displayAvatarURL({ size: 1024 });
    const response = await axios.get(avatarUrl, {
        responseType: 'arraybuffer',
    });
    const avatarBase64 = Buffer.from(response.data, 'binary').toString(
        'base64'
    );

    const htmlContent = `
        <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                    background-color: #e5cead; /* Page background color */
                    color: #E0FBE2; /* Light color for values */
                }
                .content {
                    margin: 20px;
                    background-color: #333;
                    padding: 20px;
                    border-radius: 10px;
                    color: #E0FBE2; /* Light color for values */
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
                }
                h1 {
                    color: #ACE1AF; /* Coffee color for titles */
                    margin-bottom: 20px;
                }
                h2 {
                    color: #ACE1AF; /* Green color for titles */
                    border-bottom: 1px solid #f1f1f1;
                }
                p {
                    margin-bottom: 10px;
                }
                .footer {
                    position: absolute;
                    right: 20px;
                    bottom: 20px;
                    font-size: 0.8em;
                    color: #aaa;
                }
                .logo {
                    position: absolute;
                    left: 20px;
                    bottom: 20px;
                    width: 100px; /* Adjust as needed */
                    height: auto; /* Maintain aspect ratio */
                }
                .report {
                    position: absolute;
                    left: 130px; /* Adjust as needed */
                    bottom: 30px; /* Adjust as needed */
                    color: #A79277; /* Coffee color */
                }
                .date {
                    position: absolute;
                    left: 130px; /* Adjust as needed */
                    bottom: 10px; /* Adjust as needed */
                    color: #A79277; /* Coffee color */
                }
                .avatar {
                    position: absolute;
                    right: 20px;
                    top: 20px;
                    width: 100px; /* Adjust as needed */
                    height: auto; /* Maintain aspect ratio */
                }
            </style>
        </head>
        <body>
            <img class="avatar" src="data:image/png;base64,${avatarBase64}" alt="Avatar">
            <div class="content">
                <h1>Feedback from ${discordName}</h1>
                <h2>Utility Score</h2>
                <p>${utilityInput}</p>
                <h2>Usage</h2>
                <p>${usageInput}</p>
                <h2>Improvement Suggestions</h2>
                <p>${improvementInput}</p>
            </div>
            <div class="footer">User ID: ${discordId}</div>
            <img class="logo" src="data:image/png;base64,${logoBase64}" alt="Logo">
            <div class="report">Report generated by Lucky</div>
            <div class="date">${dateString}</div>
        </body>
        </html>
        `;

    // Convert the HTML to PDF
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setContent(htmlContent);
    const pdfBuffer = await page.pdf({ format: 'A4', timeout: 10000 }); // 10 seconds timeout

    // Send the buffer as an attachment
    const guild = client.guilds.cache.get('502931781012684818');
    const channel = guild.channels.cache.get('1189276341011501197');
    await (channel as TextChannel).send({
        files: [
            {
                attachment: Buffer.from(pdfBuffer),
                name: `feedback-${discordName}-${dateString}.pdf`,
            },
        ],
    });

    // Close the modal by sending an interaction update with no components
    await interaction.editReply({ content: 'Merci pour ton retour!' });

    await browser.close();
};

export const feedbackTutorial = async (interaction: ButtonInteraction) => {
    const tutoPath = path.resolve(
        __dirname,
        '../../../assets/image/feedback/lucky-fb-tuto.gif'
    );
    const attachment = new AttachmentBuilder(tutoPath, {
        name: 'lucky-fb-tuto.gif',
    });

    const embed = new EmbedBuilder()
        .setTitle('Salut! 👋')
        .setDescription(
            "✨ Voici un petit tutoriel pour t'aider à remplir le formulaire de feedback."
        )
        .addFields(
            {
                name: '1. Clique droit sur mon pseudo 🐟',
                value: 'Clique sur **application**',
            },
            {
                name: '2. Selectionne feedback 📰',
                value: 'Remplis le formulaire et clique sur **Submit**',
            }
        )
        .setColor('Blue')
        .setImage('attachment://lucky-fb-tuto.gif')
        .setTimestamp()
        .setFooter({
            text: 'Lucky - Archive Feedback',
            iconURL: interaction.user.displayAvatarURL(),
        });

    if ('update' in interaction) {
        await interaction.update({
            embeds: [embed],
            files: [attachment],
            components: [],
        });
    }
};
