import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export const menuRow = new ActionRowBuilder<ButtonBuilder>();
menuRow.addComponents(
    new ButtonBuilder()
        .setCustomId('archive-home')
        .setLabel('Menu')
        .setEmoji('🏠')
        .setStyle(ButtonStyle.Primary)
);
