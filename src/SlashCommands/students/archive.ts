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

const logTime = (message: string) => {
    console.log(`${new Date().toISOString()} - ${message}`);
};

const deferReplyWithRetry = async (interaction, retries = 3, delay = 1000) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            logTime(
                `Attempting to defer reply for interaction ${interaction.id}, attempt ${attempt}`
            );
            await interaction.deferReply({ ephemeral: true });
            logTime(
                `Successfully deferred reply for interaction ${interaction.id} on attempt ${attempt}`
            );
            return true;
        } catch (error) {
            console.error(
                `Attempt ${attempt} to defer reply for interaction ${interaction.id} failed: ${error}`
            );
            if (attempt < retries) {
                await new Promise((resolve) => setTimeout(resolve, delay));
            }
        }
    }
    return false;
};

exports.default = new SlashCommand({
    name: 'archive',
    description: 'Simply, the archive.',
    run: async ({ interaction }) => {
        logTime(`Received interaction: ${interaction.id}`);

        const deferred = await deferReplyWithRetry(interaction);
        if (!deferred) {
            console.error(
                `Failed to defer reply for interaction ${interaction.id} after multiple attempts.`
            );
            return;
        }

        try {
            const userId = interaction.user.id;
            const username = interaction.user.username;
            const command = 'archive';

            logTime(
                `User ${username} (ID: ${userId}) summoned the ${command} command.`
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
            logTime(
                `Replied with archive canvas for interaction: ${interaction.id}`
            );
        } catch (error) {
            console.error(
                `Failed to reply with archive canvas for interaction ${interaction.id}: ${error}`
            );
        }
    },
});
