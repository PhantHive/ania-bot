import { Canvas } from 'canvas';
import { AttachmentBuilder, ActionRowBuilder, ButtonBuilder } from 'discord.js';
import { join } from 'path';
import { readdirSync } from 'fs';
import drawArchiveCanvas from '../canvas/drawingCanvas';
import { ButtonInteraction } from 'discord.js';
import data from '../../../../assets/json/promos.json';
import { translator } from './translator';

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
    title: string,
    field: string,
    ressource: string
) => {
    const numbers: string[] = [
        '994405022894919820',
        '994405021070401576',
        '994405018167934976',
        '994405016246947860',
        '994405014523097158',
        '994405012799238214',
        '94405009355722772',
    ];

    const category: string = field.split('-')[1];
    const topicName: string = field.split('-')[0];

    const row = new ActionRowBuilder<ButtonBuilder>();

    const topics: string[] = await getTopics(category, topicName, ressource);

    // translate every topics
    const translatedTopics = topics.map((topic) => translator(topic, 'fr'));

    if (topics.length === 0) {
        return { buffer: null, row: null };
    }

    const canvas: Canvas = await drawArchiveCanvas(title, translatedTopics);
    topics.forEach((topic, index) => {
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

    // canvas to gif as a message attachment for discord
    const buffer = new AttachmentBuilder(canvas.toBuffer(), {
        name: 'archive.gif',
    });

    return { buffer, row };
};

const showTopics = async (interaction: ButtonInteraction, field: string) => {
    let ressource: string;
    data.forEach((promo) => {
        if (promo['id'] === interaction.guild.id) {
            ressource = promo['ressources'];
        }
    });

    const { buffer, row } = await drawTopicsCanvas(
        'Les modules',
        field,
        ressource
    );

    if (buffer === null || row === null) {
        return interaction.update({
            content: "Aucun **Topic** n'a été trouvé",
        });
    }

    await interaction
        .update({ content: '', files: [buffer], components: [row] })
        .catch((err) => console.error(err));
};

export { drawTopicsCanvas, showTopics };
