import { Canvas } from 'canvas';
import { AttachmentBuilder, ActionRowBuilder, ButtonBuilder } from 'discord.js';
import { join } from 'path';
import { readdirSync } from 'fs';
import drawArchiveCanvas from '../canvas/drawingCanvas';
import { ButtonInteraction } from 'discord.js';
import data from '../../../../assets/json/promos.json';
import { translator } from './translator';

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

const drawFicheCanvas = async (ressource) => {
    const numbers = [
        '994405022894919820',
        '994405021070401576',
        '994405018167934976',
        '994405016246947860',
        '994405014523097158',
        '994405012799238214',
        '994405009355722772',
        '994720845425545306',
    ];

    const row = new ActionRowBuilder<ButtonBuilder>();
    const row2 = new ActionRowBuilder<ButtonBuilder>();

    const topics: string[] = await getFiches(ressource);

    // translate every topics
    const translatedTopics = topics.map((topic) => translator(topic, 'fr'));

    if (topics.length === 0) {
        return { buffer: null, row: null };
    }

    const canvas: Canvas = await drawArchiveCanvas(
        'Les fiches',
        translatedTopics
    );

    topics.forEach((topic, index) => {
        if (topic == null) {
            return;
        }
        try {
            if (index < 4) {
                row.addComponents(
                    new ButtonBuilder()
                        .setCustomId(`${topic}-sheet`)
                        .setEmoji(numbers[index])
                        .setStyle(2)
                );
            } else {
                row2.addComponents(
                    new ButtonBuilder()
                        .setCustomId(`${topic}-sheet`)
                        .setEmoji(numbers[index])
                        .setStyle(2)
                );
            }
        } catch (e) {}
    });

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

    const { buffer, row, row2 } = await drawFicheCanvas(ressource);

    if (buffer === null || row === null) {
        return interaction.update({
            content: "Aucune **fiche** n'a été trouvé",
        });
    }

    if (row2.components.length > 0) {
        try {
            await interaction.update({
                content: '',
                files: [buffer],
                components: [row, row2],
            });
        } catch (e) {
            throw e;
        }
    } else {
        try {
            await interaction.update({
                content: '',
                files: [buffer],
                components: [row],
            });
        } catch (e) {
            throw e;
        }
    }
};

export { drawFicheCanvas, showFiches };
