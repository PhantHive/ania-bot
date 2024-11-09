import {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    ButtonInteraction,
    EmbedBuilder,
} from 'discord.js';
import StudentModel from '../../../assets/utils/models/MailSystem';

// Modal IDs for different verification steps
export const MODAL_IDS = {
    EMAIL_VERIFICATION: 'email_verification',
    CODE_VERIFICATION: 'code_verification',
} as const;

const createEmailModal = (): ModalBuilder => {
    const modalBuilder = new ModalBuilder()
        .setCustomId(MODAL_IDS.EMAIL_VERIFICATION)
        .setTitle('Student Email Verification');

    const emailInput = new TextInputBuilder()
        .setCustomId('email')
        .setLabel('Enter your IPSA student email')
        .setPlaceholder('firstname.lastname@ipsa.fr')
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setMinLength(5)
        .setMaxLength(100);

    const actionRow = new ActionRowBuilder<TextInputBuilder>();
    actionRow.addComponents([emailInput]);

    modalBuilder.addComponents([actionRow]);

    return modalBuilder;
};

const createCodeModal = (): ModalBuilder => {
    const modalBuilder = new ModalBuilder()
        .setCustomId(MODAL_IDS.CODE_VERIFICATION)
        .setTitle('Enter Verification Code');

    const codeInput = new TextInputBuilder()
        .setCustomId('code')
        .setLabel('Enter the 6-digit code from your email')
        .setPlaceholder('123456')
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setMinLength(6)
        .setMaxLength(6);

    const actionRow = new ActionRowBuilder<TextInputBuilder>();
    actionRow.addComponents([codeInput]);

    modalBuilder.addComponents([actionRow]);

    return modalBuilder;
};

const createInfoEmbed = (interaction: ButtonInteraction): EmbedBuilder => {
    return new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle('IPSA Email Verification')
        .setDescription(
            'Please check your inbox after submitting your email. ' +
                'You will receive a verification code that expires in 10 minutes.'
        )
        .addFields(
            {
                name: 'Privacy Notice',
                value: 'Your email will be encrypted and stored securely. For more information about our privacy policy, visit https://lucky.phearion.fr/#/privacy',
            },
            {
                name: 'Need Help?',
                value: 'If you encounter any issues, please visit our support channel <#884401487395057695>',
            }
        )
        .setFooter({
            text: 'IPSA Student Verification System',
            iconURL: interaction.guild?.iconURL() || undefined,
        });
};

const showModal = async (interaction: ButtonInteraction): Promise<void> => {
    try {
        // Check if user has a pending verification
        const student = await StudentModel.findOne({
            discordId: interaction.user.id,
            'pendingVerification.expiresAt': { $gt: new Date() },
        });

        if (student?.pendingVerification) {
            // If there's a pending verification, show code input modal
            const codeModal = createCodeModal();
            await interaction.showModal(codeModal);
        } else {
            // If no pending verification, show email input modal
            const emailModal = createEmailModal();
            await interaction.showModal(emailModal);

            // Send the informational embed as a follow-up
            const infoEmbed = createInfoEmbed(interaction);
            await interaction.followUp({
                embeds: [infoEmbed],
                ephemeral: true,
            });
        }
    } catch (error) {
        console.error('Error displaying verification modal:', error);
        await interaction.reply({
            content:
                'An error occurred while processing your request. Please try again later or contact support.',
            ephemeral: true,
        });
    }
};

export { showModal };
