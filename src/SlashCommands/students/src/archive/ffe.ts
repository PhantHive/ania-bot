import fs from 'fs';
import { join } from 'path';
import { ButtonInteraction } from 'discord.js';

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
            files.forEach(function (file: string) {
                try {
                    const lastUnder = file.lastIndexOf('_'); // Under = underscord, looking for the last inderscore index.
                    const sheetType = file.split('_')[0];
                    const subject = file.split('_')[1];
                    let year = file.substr(lastUnder + 1);
                    year = year.split('.')[0];
                    let full_name = file.split('.')[0].split('_')[2];
                    full_name = full_name.replace(/-/g, ' ');

                    interaction
                        .followUp({
                            content: `<a:aniaressources:865350631560314890> **${sheetType}** concerning **${subject}** from *${full_name}* in ${year}`,
                            files: [join(`${sheet_dir}`, `${file}`)],
                            ephemeral: true,
                        })
                        .catch((err) => console.log('Request aborted: ', err));
                } catch {
                    interaction.followUp({
                        content: `Error: A file is not in the right format, please contact an administrator.`,
                        ephemeral: true,
                    });
                }
            });
        }
    });
};

export { getFiles };
