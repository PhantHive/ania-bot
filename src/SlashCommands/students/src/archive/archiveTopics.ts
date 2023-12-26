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

const getTopics = async (
    category: string,
    topicName: string,
    ressource: string
): Promise<string[]> => {
    const fields = [];
    try {
        const field_dir = readdirSync(
            join(
                __dirname,
                '..',
                '..',
                '..',
                '..',
                'assets',
                ressource,
                `${topicName}`
            )
        );
        field_dir.forEach((dir_type) => {
            if (dir_type === 'mp' && category === 'mp') {
                readdirSync(
                    join(
                        __dirname,
                        '..',
                        '..',
                        '..',
                        '..',
                        'assets',
                        ressource,
                        `${topicName}`,
                        'mp'
                    )
                ).forEach((topic) => {
                    fields.push(topic);
                });
            }
            if (dir_type === 'lab' && category === 'lab') {
                readdirSync(
                    join(
                        __dirname,
                        '..',
                        '..',
                        '..',
                        '..',
                        'assets',
                        ressource,
                        `${topicName}`,
                        'lab'
                    )
                ).forEach((topic) => {
                    fields.push(topic);
                });
            }
            if (dir_type === 'sheet' && category === 'sheet') {
                readdirSync(
                    join(
                        __dirname,
                        '..',
                        '..',
                        '..',
                        '..',
                        'assets',
                        ressource,
                        `${topicName}`,
                        'sheet'
                    )
                ).forEach((topic) => {
                    fields.push(topic);
                });
            }
        });
    } catch (e) {
        return [];
    }

    return fields;
};

const drawTopicsCanvas = async (
    interaction: ButtonInteraction<CacheType>,
    title: string,
    field: string,
    ressource: string
) => {
    const category: string = field.split('-')[1];
    const topicName: string = field.split('-')[0];

    const row = new ActionRowBuilder<ButtonBuilder>();
    const row2 = new ActionRowBuilder<ButtonBuilder>();

    const topics: string[] = await getTopics(category, topicName, ressource);

    // translate every topics
    const translatedTopics = topics.map((topic) => translator(topic, 'fr'));

    if (topics.length === 0) {
        return { buffer: null, row: null };
    }

    const totalPages = Math.ceil(translatedTopics.length / 8);
    console.log(interaction.user.id);
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

    console.log('tops: ', currentTopics);

    let currentTopicsRow1;
    let currentTopicsRow2;

    if (currentTopics.length > 4) {
        currentTopicsRow1 = currentTopics.slice(0, 4);
        currentTopicsRow2 = currentTopics.slice(4, 8);
    } else {
        currentTopicsRow1 = currentTopics;
        currentTopicsRow2 = [];
    }

    const canvas: Canvas = await drawArchiveCanvas(title, currentTopics);
    currentTopicsRow1.forEach((topic, index) => {
        if (topic == null) {
            return;
        }

        try {
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`${topicName}-${category}-${topic}-topics`)
                    .setEmoji(numbers[index])
                    .setStyle(2)
            );
        } catch (e) {}
    });

    currentTopicsRow2.forEach((topic, index) => {
        if (topic == null) {
            return;
        }

        try {
            row2.addComponents(
                new ButtonBuilder()
                    .setCustomId(`${topicName}-${category}-${topic}-topics`)
                    .setEmoji(numbers[index + 4])
                    .setStyle(2)
            );
        } catch (e) {}
    });

    if (totalPages > 1) {
        if (currentPage > 0) {
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`${topicName}-${category}_topic-previous`)
                    .setLabel('👈')
                    .setStyle(2)
            );
        }

        if (currentPage < totalPages - 1) {
            row2.addComponents(
                new ButtonBuilder()
                    .setCustomId(`${topicName}-${category}_topic-next`)
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

const showTopics = async (interaction: ButtonInteraction, field: string) => {
    let ressource: string;
    data.forEach((promo) => {
        if (promo['id'] === interaction.guild.id) {
            ressource = promo['ressources'];
        }
    });

    const { buffer, row, row2 } = await drawTopicsCanvas(
        interaction,
        'Les modules',
        field,
        ressource
    );

    if (buffer === null || row === null) {
        return interaction.update({
            content: "Aucun **Topic** n'a été trouvé",
        });
    }

    const components = [];
    components.push(row);

    if (row2 !== undefined && row2 !== null) {
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

export { drawTopicsCanvas, showTopics };
