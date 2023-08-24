// const request = require("request-promise");
import { SlashCommand } from '../../structures/SlashCommand';

import { getNews } from '../../events/client/src/getNews';

exports.default = new SlashCommand({
    name: 'news',
    description: 'Get latest news',
    userPermissions: ['Administrator'],
    run: async ({ interaction }) => {
        await getNews(null, interaction.guild, interaction.channel.id);
    },
});
