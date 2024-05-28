import pLimit from 'p-limit';
import fs from 'fs';
import { join } from 'path';
import {
    ActionRowBuilder,
    AttachmentBuilder,
    ButtonBuilder,
    ButtonInteraction,
    EmbedBuilder,
} from 'discord.js';

const limit = pLimit(2);

const getFiles = async (interaction: ButtonInteraction, folder: string) => {
    const sheet_dir = folder;
    await interaction.deferReply({ ephemeral: true });

    if (!fs.existsSync(sheet_dir)) {
        throw new Error(`Directory does not exist: ${sheet_dir}`);
    }

    fs.readdir(sheet_dir, async function (err, files) {
        if (err) {
            throw new Error(`Unable to scan directory for files: ${err}`);
        } else {
            await interaction.followUp({
                content: `***You summoned the FFE (fast file exporter) System*** <a:Fast:960621566536847440>`,
            });
            //listing all files using forEach
            const promises = files.map(function (file: string) {
                return limit(async () => {
                    try {
                        const lastUnder = file.lastIndexOf('_'); // Under = underscord, looking for the last inderscore index.
                        const sheetType = file.split('_')[0];
                        const subject = file.split('_')[1];
                        let year = file.substr(lastUnder + 1);
                        year = year.split('.')[0];
                        let full_name = file.split('.')[0].split('_')[2];
                        full_name = full_name.replace(/-/g, ' ');

                        try {
                            return await interaction.followUp({
                                content: `<a:aniaressources:865350631560314890> **${sheetType}** concerning **${subject}** from *${full_name}* in ${year}`,
                                files: [join(`${sheet_dir}`, `${file}`)],
                                ephemeral: true,
                            });
                        } catch (err) {
                            return console.log('Request aborted: ', err);
                        }
                    } catch {
                        return interaction.followUp({
                            content: `Error: A file is not in the right format, please contact an administrator.`,
                            ephemeral: true,
                        });
                    }
                });
            });

            const results = await Promise.allSettled(promises);

            for (const result of results) {
                if (result.status === 'rejected') {
                    console.error(`Failed to upload file: ${result.reason}`);
                }
            }

            const rate = Math.floor(Math.random() * 10);
            if (rate === 2) {
                // ask if the user is happy with the files with two buttons: 👍 or 👎
                const row = new ActionRowBuilder<ButtonBuilder>();
                row.addComponents(
                    new ButtonBuilder()
                        .setCustomId(`ffe-rate-feedback`)
                        .setLabel('Oui! 😄')
                        .setStyle(3),

                    new ButtonBuilder()
                        .setCustomId(`ffe-rate-feedback-no`)
                        .setLabel('Non! 😞')
                        .setStyle(4)
                );

                // create a futuristic embed with the image in assets/image/feedback/feedback-lucky.png
                const attachment = new AttachmentBuilder(
                    join(
                        __dirname,
                        '..',
                        '..',
                        '..',
                        '..',
                        'assets',
                        'image',
                        'feedback',
                        'feedback-lucky.png'
                    ),
                    {
                        name: 'feedback-lucky.png',
                    }
                );

                const embed = new EmbedBuilder()
                    .setTitle('Salut! 👋')
                    .setDescription(
                        'Souhaitez-vous donner un retour sur le système Archive ?'
                    )
                    .setColor('Green')
                    .setImage('attachment://feedback-lucky.png')
                    .setTimestamp()
                    .setFooter({
                        text: 'Lucky - Archive Feedback',
                        iconURL: interaction.user.displayAvatarURL(),
                    });

                await interaction.followUp({
                    embeds: [embed],
                    components: [row],
                    files: [attachment],
                    ephemeral: true,
                });
            }
        }
    });
};

export { getFiles };
