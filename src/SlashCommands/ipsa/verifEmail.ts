import { SlashCommand } from '../../structures/SlashCommand';

import { ButtonStyle, ButtonBuilder, ActionRowBuilder } from 'discord.js';

exports.default = new SlashCommand({
    name: 'email-verif',
    description: 'Verification Email',
    userPermissions: ['Administrator'],
    run: async ({ interaction }) => {
        const actionRow = new ActionRowBuilder<ButtonBuilder>();
        // create button to open modal
        const button = new ButtonBuilder()
            .setCustomId('open-email-modal')
            .setLabel('Verification Email')
            .setStyle(ButtonStyle.Primary);

        actionRow.addComponents(button);

        // send button to channel id 824329178450493512
        try {
            await interaction.channel.send({ components: [actionRow] });
        } catch (e) {
            await interaction.reply({
                content: 'Une erreur est survenue' + e,
                ephemeral: true,
            });
        }
    },
});
