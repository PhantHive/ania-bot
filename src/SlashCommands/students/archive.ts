import {
    ButtonBuilder,
    ActionRowBuilder,
    ButtonStyle,
    AttachmentBuilder,
} from 'discord.js';
import drawArchiveCanvas from './src/canvas/drawingCanvas';
import { SlashCommand } from '../../structures/SlashCommand';
import { Canvas } from 'canvas';

exports.default = new SlashCommand({
    name: 'archive',
    description: 'Simply, the archive.',
    run: async ({ interaction }) => {
        console.log(
            `User ${interaction.user.tag} summoned the archive command.`
        );

        await interaction.deferReply({ ephemeral: true });

        let topics = ['MP', 'TP', 'FICHES', 'ENVOYER'];
        let canvas: Canvas = await drawArchiveCanvas('The Archive', topics);

        // Button builders
        const mpButton = new ButtonBuilder()
            .setCustomId('mp')
            .setEmoji('994405022894919820')
            .setStyle(ButtonStyle.Secondary);

        const tpButton = new ButtonBuilder()
            .setCustomId('tp')
            .setEmoji('994405021070401576')
            .setStyle(2);

        const sheetsButton = new ButtonBuilder()
            .setCustomId('sheets')
            .setEmoji('994405018167934976')
            .setStyle(2);

        const sendFilesButton = new ButtonBuilder()
            .setCustomId('send_files')
            .setEmoji('994405016246947860')
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
