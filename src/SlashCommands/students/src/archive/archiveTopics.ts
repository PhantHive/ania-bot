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
import { numbers } from './userPages';

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
    ressource: string,
    currentPage: number = 0
) => {
    const lastDash = field.lastIndexOf('_');
    const category = String.prototype.slice.call(field, lastDash + 1);
    const topicName = String.prototype.slice.call(field, 0, lastDash);

    console.log(
        `[${new Date().toISOString()}] User ${interaction.user.username} (ID: ${
            interaction.user.id
        }) accessed the category: ${category}.`
    );
    console.log(
        `[${new Date().toISOString()}] User ${interaction.user.username} (ID: ${
            interaction.user.id
        }) accessed the topic: ${topicName}.`
    );

    const row = new ActionRowBuilder<ButtonBuilder>();
    const row2 = new ActionRowBuilder<ButtonBuilder>();

    const topics: string[] = await getTopics(category, topicName, ressource);

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

    const canvas: Canvas = await drawArchiveCanvas(title, currentTopics);
    currentTopicsRow1.forEach((topic, index) => {
        if (topic == null) {
            return;
        }

        // map back to the original topic name
        const originalTopic = topics.find((t) => translator(t, 'fr') === topic);

        try {
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(
                        `${topicName}_${category}_${originalTopic}-topics`
                    )
                    .setEmoji(numbers[index])
                    .setStyle(2)
            );
        } catch (e) {}
    });

    currentTopicsRow2.forEach((topic, index) => {
        if (topic == null) {
            return;
        }

        const originalTopic = topics.find((t) => translator(t, 'fr') === topic);

        try {
            row2.addComponents(
                new ButtonBuilder()
                    .setCustomId(
                        `${topicName}_${category}_${originalTopic}-topics`
                    )
                    .setEmoji(numbers[index + 4])
                    .setStyle(2)
            );
        } catch (e) {}
    });

    if (totalPages > 1) {
        if (currentPage > 0) {
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(
                        `${topicName}_${category}_topic-previous-${currentPage}`
                    )
                    .setLabel('👈')
                    .setStyle(2)
            );
        }

        if (currentPage < totalPages - 1) {
            row2.addComponents(
                new ButtonBuilder()
                    .setCustomId(
                        `${topicName}_${category}_topic-next-${currentPage}`
                    )
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

    if (row2.components.length > 0) {
        components.push(row2);
    }

    try {
        return interaction.update({
            content: '',
            files: [buffer],
            components: components,
        });
    } catch (e) {
        throw e;
    }
};

export { drawTopicsCanvas, showTopics };
