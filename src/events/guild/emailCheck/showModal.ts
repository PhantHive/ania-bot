import {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    ButtonInteraction,
} from 'discord.js';

const createEmailModal = (): ModalBuilder => {
    // Create a new modal
    const modalBuilder = new ModalBuilder()
        .setCustomId('verification')
        .setTitle('Verification Email');

    // Create a text input for email entry
    const emailInput = new TextInputBuilder()
        .setCustomId('email')
        .setLabel('Email (e.g., "firstname.lastname@ipsa.fr")')
        .setStyle(TextInputStyle.Short);

    // Create an action row for the text input
    const actionRow = new ActionRowBuilder<TextInputBuilder>();
    actionRow.addComponents([emailInput]);

    // Add the action row to the modal
    modalBuilder.addComponents([actionRow]);

    return modalBuilder;
};

const showModal = async (interaction: ButtonInteraction): Promise<void> => {
    try {
        const modal = createEmailModal();

        // Show the modal to the user
        await interaction.showModal(modal);
    } catch (error) {
        // Handle any errors that occur during modal creation or display
        console.error('Error displaying the email modal:', error);
    }
};

export { showModal };
