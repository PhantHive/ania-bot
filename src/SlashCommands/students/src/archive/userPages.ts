// userPages.ts
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
} from 'discord.js';

const numbers = [
    '1189297626529660968',
    '1189297624046641243',
    '1189297622020792340',
    '1189297618996690994',
    '1189297616605941811',
    '1189297614403932261',
    '1189297612323553443',
    '1189297608947150858',
    '1105207324307636397',
];

const sendNewPage = async (
    interaction: ButtonInteraction,
    buffer: Buffer,
    row: ActionRowBuilder<ButtonBuilder>,
    row2: ActionRowBuilder<ButtonBuilder>
): Promise<void> => {
    // Now, send or update the interaction and filter any empty rows
    const components = [row, row2].filter((r) => r.components.length > 0);
    const menuRow = new ActionRowBuilder<ButtonBuilder>();
    menuRow.addComponents(
        new ButtonBuilder()
            .setCustomId('archive-home')
            .setLabel('Menu')
            .setEmoji('🏠')
            .setStyle(ButtonStyle.Primary)
    );

    components.push(menuRow);

    try {
        await interaction.update({ content: '', files: [buffer], components });
    } catch (error) {
        console.error('Error updating the interaction:', error);
        // Handle the error appropriately
    }
};

export { numbers, sendNewPage };
