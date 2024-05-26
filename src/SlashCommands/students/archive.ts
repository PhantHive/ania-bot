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

const deferReplySafely = async (interaction) => {
    try {
        logTime(`Attempting to defer reply for interaction ${interaction.id}`);
        await interaction.deferReply({ ephemeral: true });
        logTime(
            `Successfully deferred reply for interaction ${interaction.id}`
        );
        return true;
    } catch (error) {
        if (error.code === 10062) {
            console.error(
                `Failed to defer reply for interaction ${interaction.id}: Unknown interaction`
            );
        } else if (error.code === 40060) {
            console.error(
                `Failed to defer reply for interaction ${interaction.id}: Interaction has already been acknowledged`
            );
        } else {
            console.error(
                `Failed to defer reply for interaction ${interaction.id}: ${error}`
            );
        }
        return false;
    }
};

exports.default = new SlashCommand({
    name: 'archive',
    description: 'Simply, the archive.',
    run: async ({ interaction }) => {
        logTime(`Received interaction: ${interaction.id}`);

        const deferred = await deferReplySafely(interaction);
        if (!deferred) {
            console.error(
                `Failed to defer reply for interaction ${interaction.id}.`
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
