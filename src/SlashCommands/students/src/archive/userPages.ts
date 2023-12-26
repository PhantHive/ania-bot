import { ButtonInteraction, CacheType } from 'discord.js';

// userPages.ts
export const userPages = new Map<
    string,
    { currentPage: number; totalPages: number }
>();

export const numbers = [
    '1189297626529660968',
    '1189297624046641243',
    '1189297622020792340',
    '1189297618996690994',
    '1189297616605941811',
    '1189297614403932261',
    '1189297612323553443',
    '1189297608947150858',
];

export const sendNewPage = async (
    interaction: ButtonInteraction<CacheType>,
    buffer,
    row,
    row2
) => {
    const components = [];
    components.push(row);

    console.log(row2);

    if (row2 !== null && row2 !== undefined) {
        if (row2.components.length > 0) {
            components.push(row2);
        }
    }

    try {
        await interaction.update({
            content: '',
            files: [buffer],
            components: components,
        });
    } catch (e) {
        await interaction.reply({
            content: '',
            files: [buffer],
            components: components,
        });
    }
};
