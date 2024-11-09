import { ModalSubmitInteraction } from 'discord.js';
import { EmailVerification } from './checkMail';
import { MODAL_IDS } from './showModal';
import { createLogger, format, transports } from 'winston';

// Configure Winston logger
const logger = createLogger({
    format: format.combine(format.timestamp(), format.json()),
    transports: [
        new transports.File({ filename: 'verification.log' }),
        new transports.Console({
            format: format.combine(format.colorize(), format.simple()),
        }),
    ],
});

export async function handleVerificationModal(
    interaction: ModalSubmitInteraction,
    client: any
): Promise<void> {
    try {
        await interaction.deferReply({ ephemeral: true });

        switch (interaction.customId) {
            case MODAL_IDS.EMAIL_VERIFICATION: {
                const email = interaction.fields.getTextInputValue('email');
                const verificationSystem = new EmailVerification(
                    interaction,
                    client,
                    email
                );
                const response = await verificationSystem.startVerification();

                await interaction.editReply({
                    content: response,
                });
                break;
            }

            case MODAL_IDS.CODE_VERIFICATION: {
                const code = interaction.fields.getTextInputValue('code');
                let response = await EmailVerification.verifyCode(
                    interaction,
                    code
                );

                if (response.includes('successful')) {
                    try {
                        const member = interaction.guild?.members.cache.get(
                            interaction.user.id
                        );
                        if (member) {
                            const verifiedRole =
                                interaction.guild?.roles.cache.find(
                                    (role) =>
                                        role.name.toLowerCase() === 'ipsalien'
                                );

                            if (verifiedRole) {
                                await member.roles.add(verifiedRole);
                                response +=
                                    '\nThe IPSAlien role has been assigned to you.';
                            }
                        }
                    } catch (error) {
                        logger.error('Error assigning role:', error);
                        response +=
                            '\nNote: There was an issue assigning your role. Please contact support.';
                    }
                }

                await interaction.editReply({ content: response });
                break;
            }

            default:
                logger.warn(`Unknown modal ID: ${interaction.customId}`);
                await interaction.editReply({
                    content:
                        'An error occurred. Please try again or contact support.',
                });
        }
    } catch (error) {
        logger.error('Error handling modal submission:', error);
        await interaction
            .editReply({
                content:
                    'An error occurred while processing your submission. Please try again later or contact support.',
            })
            .catch(console.error);
    }
}
