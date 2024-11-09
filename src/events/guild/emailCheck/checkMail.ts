import { ModalSubmitInteraction } from 'discord.js';
import { ExtendedClient } from '../../../structures/Client';
import StudentModel from '../../../assets/utils/models/MailSystem';
import crypto, { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import nodemailer from 'nodemailer';
import { createLogger, format, transports } from 'winston';
import { join } from 'path';
import { IStudentDocument } from '../../../typings/MongoTypes';

// Promisify scrypt
const scryptAsync = promisify(scrypt);

// Configure Winston logger with additional security events
const logger = createLogger({
    format: format.combine(format.timestamp(), format.json()),
    transports: [
        new transports.File({ filename: 'verification.log' }),
        new transports.File({ filename: 'security.log', level: 'warn' }),
        new transports.Console({
            format: format.combine(format.colorize(), format.simple()),
        }),
    ],
});

// Configure SMTP Transport with fail-safe options
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT as string),
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    tls: {
        rejectUnauthorized: true,
        minVersion: 'TLSv1.2',
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
});

interface RateLimitInfo {
    attempts: number;
    firstAttempt: number;
    locked: boolean;
    lockExpiry?: number;
}

class EmailVerification {
    private static readonly CODE_EXPIRY = 10 * 60 * 1000; // 10 minutes
    private static readonly VERIFICATION_ATTEMPTS = new Map<string, number>();
    private static readonly MAX_ATTEMPTS = 3;
    private static readonly ACCOUNT_LOCKS = new Map<string, number>();
    private static readonly LOCKOUT_DURATION = 24 * 60 * 60 * 1000; // 24 hours
    private static readonly SCRYPT_KEYLEN = 64;
    private static readonly PEPPER = process.env.EMAIL_PEPPER; // Additional server-side secret

    private readonly interaction: ModalSubmitInteraction;
    private readonly client: ExtendedClient;
    private readonly email: string;

    constructor(
        interaction: ModalSubmitInteraction,
        client: ExtendedClient,
        email: string
    ) {
        this.interaction = interaction;
        this.client = client;
        this.email = email.toLowerCase();
    }

    private async checkRateLimit(): Promise<{
        allowed: boolean;
        message?: string;
    }> {
        const userId = this.interaction.user.id;
        const now = Date.now();

        // Check account lock
        const lockExpiry = EmailVerification.ACCOUNT_LOCKS.get(userId);
        if (lockExpiry && lockExpiry > now) {
            const remainingHours = Math.ceil(
                (lockExpiry - now) / (60 * 60 * 1000)
            );
            return {
                allowed: false,
                message: `Your account is temporarily locked due to suspicious activity. Please try again in ${remainingHours} hours.`,
            };
        }
        return { allowed: true };
    }

    private async lockAccount(reason: string): Promise<void> {
        const userId = this.interaction.user.id;
        const lockExpiry = Date.now() + EmailVerification.LOCKOUT_DURATION;

        EmailVerification.ACCOUNT_LOCKS.set(userId, lockExpiry);

        logger.warn({
            message: 'Account locked',
            userId: userId,
            reason: reason,
            expiresAt: new Date(lockExpiry),
        });

        // Update database with lock information
        await StudentModel.updateOne(
            { discordId: userId },
            {
                $set: {
                    securityLock: {
                        lockedAt: new Date(),
                        reason: reason,
                        expiresAt: new Date(lockExpiry),
                    },
                },
            },
            { upsert: true }
        );
    }

    private async sendVerificationEmail(code: string): Promise<boolean> {
        try {
            const mailOptions = {
                from: {
                    name: 'IPSA Discord Verification LUCKY',
                    address: process.env.SMTP_USER as string,
                },
                to: this.email,
                subject: 'Your IPSA Discord Verification Code',
                html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>IPSA Discord Verification</title>
            <style>
                @keyframes gradient {
                    0% {
                        background-position: 0% 50%;
                    }
                    50% {
                        background-position: 100% 50%;
                    }
                    100% {
                        background-position: 0% 50%;
                    }
                }
                .code-container {
                    background: linear-gradient(
                        45deg, 
                        #FF6B6B,
                        #4ECDC4,
                        #45B7D1,
                        #96C93D,
                        #FFA07A,
                        #FF69B4
                    );
                    background-size: 300% 300%;
                    animation: gradient 10s ease infinite;
                    padding: 20px;
                    border-radius: 15px;
                    margin: 30px 0;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                    position: relative;
                    overflow: hidden;
                }
                .code-container::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(
                        45deg,
                        rgba(255, 255, 255, 0.1),
                        rgba(255, 255, 255, 0.2)
                    );
                    z-index: 1;
                }
                .code-text {
                    position: relative;
                    z-index: 2;
                    color: white;
                    font-size: 36px;
                    font-weight: bold;
                    letter-spacing: 8px;
                    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
                    font-family: 'Courier New', monospace;
                    display: inline-block;
                    padding: 10px 20px;
                    background: rgba(0, 0, 0, 0.2);
                    border-radius: 8px;
                    border: 2px solid rgba(255, 255, 255, 0.3);
                }
            </style>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1c2c 0%, #2a2d3e 100%);">
                <tr>
                    <td style="padding: 40px 20px; text-align: center;">
                        <!-- Header with Logo -->
                        <table width="100%" cellspacing="0" cellpadding="0">
                            <tr>
                                <td style="text-align: center; padding-bottom: 30px;">
                                    <img src="cid:logoImage" alt="IPSA Discord" style="width: 150px; height: auto;">
                                </td>
                            </tr>
                        </table>
                        
                        <!-- Main Content -->
                        <div style="background: rgba(255, 255, 255, 0.1); border-radius: 15px; padding: 30px; margin: 20px 0; color: white;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px;">
                                Verification Code
                            </h1>
                            <p style="color: #b8b9be; margin: 20px 0;">
                                Use this code to verify your IPSA Discord account:
                            </p>
                            <div class="code-container">
                                <div class="code-text">
                                    ${code}
                                </div>
                            </div>
                            <p style="color: #b8b9be; font-size: 14px;">
                                This code will expire in 10 minutes.
                            </p>
                        </div>
                        
                        <!-- Footer -->
                        <div style="border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 20px; margin-top: 30px; color: #b8b9be; font-size: 12px;">
                            <p>
                                If you didn't request this code, please ignore this email.
                                Please do not reply to this email, we are unable to respond to messages sent to this address through direct reply to this email.
                            </p>
                            <p style="margin-top: 20px;">
                                © ${new Date().getFullYear()} IPSA Discord Team Powered by Phearion Network.
                            </p>
                        </div>
                    </td>
                </tr>
            </table>
        </body>
        </html>
    `,
                attachments: [
                    {
                        filename: 'lucky-feedback.png',
                        path: join(
                            __dirname,
                            '../../../assets/image/logo/lucky-feedback.png'
                        ),
                        cid: 'logoImage',
                    },
                ],
            };

            await transporter.sendMail(mailOptions);
            logger.info(`Verification email sent to ***`);
            return true;
        } catch (error) {
            logger.error('Error sending verification email:', error);
            return false;
        }
    }

    private isValidIpsaEmail(email: string): boolean {
        return (
            email.endsWith('@ipsa.fr') &&
            email.includes('.') &&
            email.split('@')[0].includes('.')
        );
    }

    private async hashEmail(
        email: string
    ): Promise<{ hash: string; salt: string }> {
        try {
            const salt = randomBytes(32).toString('hex');
            // Combine email with pepper before hashing
            const peppered = `${email}${EmailVerification.PEPPER}`;
            const buffer = (await scryptAsync(
                peppered,
                salt,
                EmailVerification.SCRYPT_KEYLEN
            )) as Buffer;
            return {
                hash: buffer.toString('hex'),
                salt: salt,
            };
        } catch (error) {
            logger.error('Error in email hashing:', error);
            throw new Error('Security operation failed');
        }
    }

    private async verifyEmailHash(
        inputEmail: string,
        storedHash: string,
        storedSalt: string
    ): Promise<boolean> {
        try {
            const peppered = `${inputEmail}${EmailVerification.PEPPER}`;
            const buffer = (await scryptAsync(
                peppered,
                storedSalt,
                EmailVerification.SCRYPT_KEYLEN
            )) as Buffer;
            return buffer.toString('hex') === storedHash;
        } catch (error) {
            logger.error('Error verifying email hash:', error);
            return false;
        }
    }

    private async storeVerificationCode(code: string): Promise<void> {
        const hashedCode = crypto
            .createHash('sha256')
            .update(code + process.env.CODE_SALT)
            .digest('hex');

        // Hash the email
        const { hash: emailHash, salt: emailSalt } = await this.hashEmail(
            this.email
        );

        await StudentModel.updateOne(
            { discordId: this.interaction.user.id },
            {
                $set: {
                    pendingVerification: {
                        code: hashedCode,
                        expiresAt: new Date(
                            Date.now() + EmailVerification.CODE_EXPIRY
                        ),
                        emailData: {
                            hash: emailHash,
                            salt: emailSalt,
                        },
                    },
                },
            },
            { upsert: true }
        );
    }

    public async startVerification(): Promise<string> {
        try {
            // First check if user is already verified
            const alreadyVerified = await StudentModel.findOne({
                discordId: this.interaction.user.id,
                isVerified: true,
            });

            if (alreadyVerified) {
                logger.info(
                    `Already verified user ${this.interaction.user.tag} attempted verification`
                );
                return 'You are already verified! If you have any issues with your verification or roles, please create a ticket in the support channel.';
            }

            const rateLimit = await this.checkRateLimit();
            if (!rateLimit.allowed) {
                return (
                    rateLimit.message ||
                    'Rate limit exceeded. Please try again later.'
                );
            }

            if (!this.isValidIpsaEmail(this.email)) {
                logger.warn(`Invalid email format attempt: ***`);
                return 'Please use a valid IPSA email address (firstname.lastname@ipsa.fr).';
            }

            // Check for existing email more securely
            const existingUsers = await StudentModel.find({
                isVerified: true,
                'emailData.hash': { $exists: true },
                'emailData.salt': { $exists: true },
            });

            // Check against all existing verified emails
            for (const user of existingUsers) {
                if (
                    await this.verifyEmailHash(
                        this.email,
                        user.emailData.hash,
                        user.emailData.salt
                    )
                ) {
                    if (user.discordId === this.interaction.user.id) {
                        logger.info(
                            `User ${this.interaction.user.tag} attempted verification but is already registered`
                        );
                        return 'You are already registered in our database. If you have any issues with your email verification or roles, please create a ticket in the support channel.';
                    } else {
                        logger.warn(
                            `Duplicate email verification attempt: ${this.email}`
                        );
                        await this.lockAccount(
                            'Attempted to use already verified email'
                        );
                        return 'This email is already registered to another user. If you think this is an error, please contact support.';
                    }
                }
            }

            // Continue with verification process
            const verificationCode = this.generateVerificationCode();
            const emailSent =
                await this.sendVerificationEmail(verificationCode);

            if (!emailSent) {
                return 'Failed to send verification email. Please try again later or contact support.';
            }

            await this.storeVerificationCode(verificationCode);

            logger.info(
                `Verification process started for user ${this.interaction.user.tag}`
            );
            return 'A verification code has been sent to your email. Click the verify button again to enter the code.';
        } catch (error) {
            logger.error('Error in verification process:', error);
            return 'An error occurred during the verification process. Please try again later or contact support.';
        }
    }

    private generateVerificationCode(): string {
        return crypto.randomInt(100000, 999999).toString();
    }

    public static async verifyCode(
        interaction: ModalSubmitInteraction,
        code: string
    ): Promise<string> {
        try {
            const userId = interaction.user.id;

            // Check for account lock
            const lockExpiry = this.ACCOUNT_LOCKS.get(userId);
            if (lockExpiry && lockExpiry > Date.now()) {
                const remainingHours = Math.ceil(
                    (lockExpiry - Date.now()) / (60 * 60 * 1000)
                );
                return `Your account is locked. Please try again in ${remainingHours} hours.`;
            }

            // Check attempt limits
            const attempts = this.VERIFICATION_ATTEMPTS.get(userId) || 0;
            if (attempts >= this.MAX_ATTEMPTS) {
                await new EmailVerification(interaction, null!, '').lockAccount(
                    'Exceeded maximum verification attempts'
                );
                return 'You have exceeded the maximum number of verification attempts. Your account has been locked for 24 hours.';
            }

            const student = await StudentModel.findOne({
                discordId: userId,
                'pendingVerification.expiresAt': { $gt: new Date() },
            });

            if (!student?.pendingVerification?.emailData) {
                return 'No pending verification found or code has expired. Please start the verification process again.';
            }

            // Verify the code
            const hashedInputCode = crypto
                .createHash('sha256')
                .update(code + process.env.CODE_SALT)
                .digest('hex');

            if (hashedInputCode !== student.pendingVerification.code) {
                this.VERIFICATION_ATTEMPTS.set(
                    userId,
                    (this.VERIFICATION_ATTEMPTS.get(userId) || 0) + 1
                );
                logger.warn(
                    `Invalid code attempt for user ${interaction.user.tag}`
                );
                return `Invalid verification code. You have ${this.MAX_ATTEMPTS - (this.VERIFICATION_ATTEMPTS.get(userId) || 0)} attempts remaining.`;
            }

            // Check if email has been taken during verification process
            const existingVerifiedUser = await StudentModel.findOne({
                'emailData.hash': student.pendingVerification.emailData.hash,
                'emailData.salt': student.pendingVerification.emailData.salt,
                isVerified: true,
                discordId: { $ne: userId },
            });

            if (existingVerifiedUser) {
                logger.warn(`Email was taken during verification process`);
                return 'This email has been registered by another user during your verification process. Please try again with a different email.';
            }

            // Store the hashed email data
            await StudentModel.updateOne(
                { discordId: userId },
                {
                    $set: {
                        isVerified: true,
                        emailData: student.pendingVerification.emailData,
                        verifiedAt: new Date(),
                    },
                    $unset: {
                        pendingVerification: '',
                    },
                }
            );

            // Reset attempts
            this.VERIFICATION_ATTEMPTS.delete(userId);

            logger.info(`User ${interaction.user.tag} successfully verified`);
            return 'Email verification successful! You now have access to student channels.';
        } catch (error) {
            logger.error('Error in code verification:', error);
            return 'An error occurred during code verification. Please try again later or contact support.';
        }
    }
}

export { EmailVerification };
