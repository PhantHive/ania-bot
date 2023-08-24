import { Canvas } from 'canvas';
import { AttachmentBuilder, ActionRowBuilder, ButtonBuilder } from 'discord.js';
import { join } from 'path';
import { readdirSync } from 'fs';
import drawArchiveCanvas from '../canvas/drawingCanvas';
import { ButtonInteraction } from 'discord.js';
import data from '../../../../assets/json/promos.json';

const getTopics = async (
    category: string,
    topicName: string,
    ressource: string
): Promise<string[]> => {
    let fields = [];
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
            if (dir_type === 'tp' && category === 'tp') {
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
                        'tp'
                    )
                ).forEach((topic) => {
                    fields.push(topic);
                });
            }
            if (dir_type === 'fiche' && category === 'fiche') {
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
                        'fiche'
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

    let category: string = field.split('-')[1];
    let topicName: string = field.split('-')[0];

    let row = new ActionRowBuilder<ButtonBuilder>();
    let canvas: Canvas;

    let topics: string[] = await getTopics(category, topicName, ressource);

    if (topics.length === 0) {
        return { buffer: null, row: null };
    }

    canvas = await drawArchiveCanvas(title, topics);
    topics.forEach((topic, index) => {
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
    data.forEach((promo: Object) => {
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
