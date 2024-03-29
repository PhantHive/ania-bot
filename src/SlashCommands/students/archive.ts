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

exports.default = new SlashCommand({
    name: 'archive',
    description: 'Simply, the archive.',
    run: async ({ interaction }) => {
        const timestamp = new Date().toISOString();
        const userId = interaction.user.id;
        const username = interaction.user.username;
        const command = 'archive';

        console.log(
            `[${timestamp}] User ${username} (ID: ${userId}) summoned the ${command} command.`
        );

        await interaction.deferReply({ ephemeral: true });

        const topics = ['MP', 'TP', 'FICHES', 'BIG BRAIN'];
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
            .setCustomId('bigbrain')
            .setEmoji(numbers[3])
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

        await interaction.editReply({
            files: [attachment],
            components: [row],
        });
    },
});
