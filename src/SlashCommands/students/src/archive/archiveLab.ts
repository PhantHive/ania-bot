import { Canvas } from 'canvas';
import {
    AttachmentBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    CacheType,
} from 'discord.js';
import { join } from 'path';
import { readdirSync } from 'fs';
import drawArchiveCanvas from '../canvas/drawingCanvas';
import data from '../../../../assets/json/promos.json';
import { translator } from './translator';
import { numbers } from './userPages';

const getTps = async (ressource: string): Promise<string[]> => {
    const fields = [];
    try {
        const sheet_dir = readdirSync(
            join(__dirname, '..', '..', '..', '..', 'assets', ressource)
        );
        sheet_dir.forEach((dir: string) => {
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
            field_dir.forEach((dir_type: string) => {
                if (dir_type === 'lab') {
                    fields.push(dir);
                }
            });
        });
    } catch (e) {
        return [];
    }
    return fields;
};

const drawTpCanvas = async (
    interaction: ButtonInteraction<CacheType>,
    ressource: string,
    currentPage: number = 0
) => {
    const row = new ActionRowBuilder<ButtonBuilder>();
    const row2 = new ActionRowBuilder<ButtonBuilder>();

    const topics = await getTps(ressource);

    // translate every topics
    const translatedTopics = topics.map((topic) => translator(topic, 'fr'));

    if (topics.length === 0) {
        return { buffer: null, row: null };
    }
    const totalPages = Math.ceil(translatedTopics.length / 8);

    const currentTopics = translatedTopics.slice(
        currentPage * 8,
        (currentPage + 1) * 8
    );

    let currentTopicsRow1;
    let currentTopicsRow2;

    if (currentTopics.length > 4) {
        currentTopicsRow1 = currentTopics.slice(0, 4);
        currentTopicsRow2 = currentTopics.slice(4, 8);
    } else {
        currentTopicsRow1 = currentTopics;
        currentTopicsRow2 = [];
    }

    const canvas: Canvas = await drawArchiveCanvas('Les tps', currentTopics);
    currentTopicsRow1.forEach((topic, index) => {
        if (topic == null) {
            return;
        }

        // map back to the original topic name
        const originalTopic = topics.find((t) => translator(t, 'fr') === topic);

        try {
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`${originalTopic}_lab`)
                    .setEmoji(numbers[index])
                    .setStyle(2)
            );
        } catch (e) {}
    });

    currentTopicsRow2.forEach((topic, index) => {
        if (topic == null) {
            return;
        }

        // map back to the original topic name
        const originalTopic = topics.find((t) => translator(t, 'fr') === topic);

        try {
            row2.addComponents(
                new ButtonBuilder()
                    .setCustomId(`${originalTopic}_lab`)
                    .setEmoji(numbers[index + 4])
                    .setStyle(2)
            );
        } catch (e) {}
    });

    if (totalPages > 1) {
        if (currentPage > 0) {
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`_topic-previous-${currentPage}`)
                    .setLabel('👈')
                    .setStyle(2)
            );
        }

        if (currentPage < totalPages - 1) {
            row2.addComponents(
                new ButtonBuilder()
                    .setCustomId(`_topic-next-${currentPage}`)
                    .setLabel('👉')
                    .setStyle(2)
            );
        }
    }

    // canvas to gif as a message attachment for discord
    const buffer = new AttachmentBuilder(canvas.toBuffer(), {
        name: 'archive.gif',
    });

    return { buffer, row, row2 };
};

const showTps = async (interaction: ButtonInteraction) => {
    let ressource: string;
    data.forEach((promo) => {
        if (promo['id'] === interaction.guild.id) {
            ressource = promo['ressources'];
        }
    });

    const { buffer, row, row2 } = await drawTpCanvas(interaction, ressource);

    if (buffer === null || row === null) {
        return interaction.update({
            content: "Aucun **tp** n'a été trouvé",
        });
    }

    const components = [];
    components.push(row);

    if (row2.components.length > 0) {
        components.push(row2);
    }

    try {
        await interaction.update({
            content: '',
            files: [buffer],
            components: components,
        });
    } catch (e) {
        throw e;
    }
};

export { drawTpCanvas, showTps };
