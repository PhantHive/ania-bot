import { Canvas } from 'canvas';
import { AttachmentBuilder, ButtonBuilder, ActionRowBuilder } from 'discord.js';
import { join } from 'path';
import { readdirSync } from 'fs';
import drawArchiveCanvas from '../canvas/drawingCanvas';
import { ButtonInteraction } from 'discord.js';
import data from '../../../../assets/json/promos.json';
import { translator } from './translator';

const getMps = async (ressource: string): Promise<string[]> => {
    const fields = [];
    try {
        const sheet_dir = readdirSync(
            join(__dirname, '..', '..', '..', '..', 'assets', ressource)
        );
        sheet_dir.forEach((dir) => {
            const field_dir = readdirSync(
                join(
                    __dirname,
                    '..',
                    '..',
                    '..',
                    '..',
                    'assets',
                    ressource,
                    `${dir}`
                )
            );
            field_dir.forEach((dir_type) => {
                if (dir_type === 'mp') {
                    fields.push(dir);
                }
            });
        });
    } catch (e) {
        console.log(e);
        return [];
    }
    return fields;
};

const drawMpCanvas = async (ressource: string) => {
    const numbers = [
        '994405022894919820',
        '994405021070401576',
        '994405018167934976',
        '994405016246947860',
        '994405014523097158',
        '994405012799238214',
        '94405009355722772',
    ];

    const row = new ActionRowBuilder<ButtonBuilder>();

    const topics: string[] = await getMps(ressource);

    // translate every topics
    const translatedTopics = topics.map((topic) => translator(topic, 'fr'));

    if (topics.length === 0) {
        return { buffer: null, row: null };
    }

    console.log(topics);
    const canvas: Canvas = await drawArchiveCanvas('Les mps', translatedTopics);

    topics.forEach((topic, index) => {
        if (topic == null) {
            return;
        } else {
            try {
                row.addComponents(
                    new ButtonBuilder()
                        .setCustomId(`${topic}-mp`)
                        .setEmoji(numbers[index])
                        .setStyle(2)
                );
            } catch (e) {}
        }
    });

    // canvas to gif as a message attachment for discord
    const buffer = new AttachmentBuilder(canvas.toBuffer(), {
        name: 'archive.gif',
    });

    return { buffer, row };
};

const showMps = async (interaction: ButtonInteraction) => {
    let ressource: string;
    data.forEach((promo) => {
        if (promo['id'] === interaction.guild.id) {
            ressource = promo['ressources'];
        }
    });

    const { buffer, row } = await drawMpCanvas(ressource);

    if (buffer === null || row === null) {
        return interaction.update({
            content: "Aucun **mp** n'a été trouvé",
        });
    }

    await interaction
        .update({ content: '', files: [buffer], components: [row] })
        .catch((err) => console.error(err));
};

export { drawMpCanvas, showMps };
