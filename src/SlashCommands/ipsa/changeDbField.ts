// const request = require("request-promise");
import { SlashCommand } from '../../structures/SlashCommand';
import MV from '../../typings/MongoTypes';

exports.default = new SlashCommand({
    name: 'change-db-field',
    description: 'Change a field in the database',
    userPermissions: ['Administrator'],
    run: async ({ interaction }) => {

        await interaction.deferReply();

        // for each document that contains: 28, 27, 26, 25, 24 change them to 2028, 2027, 2026, 2025, 2024

        const promos = [28, 27, 26, 25, 24];
        const newPromos = [2028, 2027, 2026, 2025, 2024];

        for (let i = 0; i < promos.length; i++) {
            const data = await MV.find({ promo: promos[i] });
            for (let j = 0; j < data.length; j++) {
                data[j].promo = newPromos[i];
                await data[j].save();
            }
        }

        await interaction.reply({
            content: 'Done !',
        });
    },
});