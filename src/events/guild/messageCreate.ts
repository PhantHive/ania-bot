import { Event } from '../../structures/Event';
import { ChannelType } from 'discord.js';

export default new Event('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (message.channel.type === ChannelType.DM) {
        if (message.content.lastIndexOf('@ipsa.fr') !== -1) {
            await message.reply(
                "** La vérification s'effectue dans le channel: <#1047648564236517396>. **"
            );
        }
    }
});
