import { Canvas } from 'canvas';
import {
    AttachmentBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    CacheType,
} from 'discord.js';
import { join } from 'path';
import { readdirSync } from 'fs';
import drawArchiveCanvas from '../canvas/drawingCanvas';
import { ButtonInteraction } from 'discord.js';
import data from '../../../../assets/json/promos.json';
import { translator } from './translator';
import { numbers, userPages } from './userPages';

const getFiches = async (ressource: string): Promise<string[]> => {
    const fields: string[] = [];

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
                if (dir_type === 'sheet') {
                    fields.push(dir);
                }
            });
        });
    } catch (e) {
        return [];
    }
    return fields;
};

const drawFicheCanvas = async (
    interaction: ButtonInteraction<CacheType>,
    ressource: string
) => {
    const row = new ActionRowBuilder<ButtonBuilder>();
    const row2 = new ActionRowBuilder<ButtonBuilder>();

    const topics: string[] = await getFiches(ressource);

    // translate every topics
    const translatedTopics = topics.map((topic) => translator(topic, 'fr'));

    const canvas: Canvas = await drawArchiveCanvas(
        'Les fiches',
        translatedTopics
    );

    if (topics.length === 0) {
        return { buffer: null, row: null };
    }

    const totalPages = Math.ceil(translatedTopics.length / 8);

    if (!userPages.has(interaction.user.id)) {
        userPages.set(interaction.user.id, { currentPage: 0, totalPages });
    } else {
        const userPage = userPages.get(interaction.user.id);
        userPages.set(interaction.user.id, { ...userPage, totalPages });
    }

    const { currentPage } = userPages.get(interaction.user.id);
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

    currentTopicsRow1.forEach((topic, index) => {
        if (topic == null) {
            return;
        }
        // map back to the original topic name
        const originalTopic = topics.find((t) => translator(t, 'fr') === topic);

        try {
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`${originalTopic}-sheet`)
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
                    .setCustomId(`${originalTopic}-sheet`)
                    .setEmoji(numbers[index])
                    .setStyle(2)
            );
        } catch (e) {}
    });

    if (totalPages > 1) {
        if (currentPage > 0) {
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId('_sheet-previous')
                    .setLabel('👈')
                    .setStyle(2)
            );
        }

        if (currentPage < totalPages - 1) {
            row2.addComponents(
                new ButtonBuilder()
                    .setCustomId('_sheet-next')
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

const showFiches = async (interaction: ButtonInteraction) => {
    let ressource: string;
    data.forEach((promo) => {
        if (promo['id'] === interaction.guild.id) {
            ressource = promo['ressources'];
        }
    });

    const { buffer, row, row2 } = await drawFicheCanvas(interaction, ressource);

    if (buffer === null || row === null) {
        return interaction.update({
            content: "Aucune **fiche** n'a été trouvé",
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

export { drawFicheCanvas, showFiches };