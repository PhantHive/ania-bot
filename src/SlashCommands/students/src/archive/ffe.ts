import fs from 'fs';
import { join } from 'path';
import { ButtonInteraction } from 'discord.js';

const getFiles = async (interaction: ButtonInteraction, folder: string) => {
    const sheet_dir = folder;

    await interaction.deferReply({ ephemeral: true });

    try {
        fs.readdir(sheet_dir, async function (err, files) {
            if (err) {
                await interaction.followUp({
                    content: 'Unable to scan directory',
                    ephemeral: true,
                });
                return console.log('Unable to scan directory: ' + err);
            }
            //listing all files using forEach
            files.forEach(function (file: string) {
                let lastUnder = file.lastIndexOf('_'); // Under = underscord, looking for the last inderscore index.
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
            });
        });

        await interaction.followUp({
            content: `***You summoned the FFE (fast file exporter) System*** <a:Fast:960621566536847440>`,
        });
        /*interaction.reply({ content: `<a:aniaressources:865350631560314890> **${sheetType}** concerning **${subject}** from *${full_name}* in ${year}` ,
            files: [`${sheet_dir}/${file}`] });*/
    } catch (err) {
        await interaction.editReply({ content: `Error: ${err}` });
        console.log(err);
    }
};

export { getFiles };
