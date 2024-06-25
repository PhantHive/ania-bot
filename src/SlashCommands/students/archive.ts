import {
    ButtonBuilder,
    ActionRowBuilder,
    ButtonStyle,
    AttachmentBuilder,
} from 'discord.js';
import drawArchiveCanvas from './src/canvas/drawingCanvas';
import { SlashCommand } from '../../structures/SlashCommand';
import { Canvas } from 'canvas';
import { numbers } from './src/archive/userPages';
import { incrementArchiveCommandCounter } from '../../metrics';

export const archiveMenu = async (interaction) => {
    const topics = ['MP', 'TP', 'FICHES', 'DONATION'];
    const canvas: Canvas = await drawArchiveCanvas('The Archive', topics);

    // Button builders
    const mpButton = new ButtonBuilder()
        .setCustomId('mp')
        .setEmoji(numbers[0])
        .setStyle(ButtonStyle.Secondary);

    const tpButton = new ButtonBuilder()
        .setCustomId('lab')
        .setEmoji(numbers[1])
        .setStyle(2);

    const sheetsButton = new ButtonBuilder()
        .setCustomId('sheet')
        .setEmoji(numbers[2])
        .setStyle(2);

    const sendFilesButton = new ButtonBuilder()
        .setCustomId('donation')
        .setEmoji(numbers[8])
        .setStyle(2);

    // Action row builder
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        mpButton,
        tpButton,
        sheetsButton,
        sendFilesButton
    );

    // canvas to gif as a message attachment for discord
    const buffer = canvas.toBuffer('image/png');
    const attachment = new AttachmentBuilder(buffer, {
        name: 'archive.png',
    });

    try {
        await interaction.editReply({
            files: [attachment],
            components: [row],
        });
    } catch {
        await interaction.update({
            files: [attachment],
            components: [row],
        });
    }
};

exports.default = new SlashCommand({
    name: 'archive',
    description: 'Simply, the archive.',
    run: async ({ interaction }) => {
        incrementArchiveCommandCounter();
        const timestamp = new Date().toISOString();
        const userId = interaction.user.id;
        const username = interaction.user.username;
        const command = 'archive';

        console.log(
            `[${timestamp}] User ${username} (ID: ${userId}) summoned the ${command} command.`
        );

        await interaction.deferReply({ ephemeral: true });

        await archiveMenu(interaction);
    },
});
