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
        console.log(`Received interaction: ${interaction.id}`);

        try {
            await interaction.deferReply({ ephemeral: true });
            console.log(`Deferred reply for interaction: ${interaction.id}`);
        } catch (error) {
            console.error(
                `Failed to defer reply for interaction ${interaction.id}: ${error}`
            );
            return;
        }

        try {
            const timestamp = new Date().toISOString();
            const userId = interaction.user.id;
            const username = interaction.user.username;
            const command = 'archive';

            console.log(
                `[${timestamp}] User ${username} (ID: ${userId}) summoned the ${command} command.`
            );

            const topics = ['MP', 'TP', 'FICHES', 'DONATION'];
            const canvas: Canvas = await drawArchiveCanvas(
                'The Archive',
                topics
            );

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
                .setEmoji(numbers[3])
                .setStyle(2);

            const actionRow =
                new ActionRowBuilder<ButtonBuilder>().addComponents(
                    mpButton,
                    tpButton,
                    sheetsButton,
                    sendFilesButton
                );

            const attachment = new AttachmentBuilder(canvas.toBuffer(), {
                name: 'archive.png',
            });

            await interaction.editReply({
                files: [attachment],
                components: [actionRow],
            });
            console.log(
                `Replied with archive canvas for interaction: ${interaction.id}`
            );
        } catch (error) {
            console.error(
                `Failed to reply with archive canvas for interaction ${interaction.id}: ${error}`
            );
        }
    },
});
