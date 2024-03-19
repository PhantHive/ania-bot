import { client } from '../../index';
import { Event } from '../../structures/Event';
import { ActivityType, Guild } from 'discord.js';
import { getNews } from './src/getNews';
import NS from '../../assets/utils/models/NewsSystem';

const sendArticle = async () => {
    const guildIpsa: Guild = client.guilds.cache.get('880491243807846450');
    console.log('Article sending process started');
    const data = await NS.findOne({
        serverId: guildIpsa.id,
    });
    if (!data) {
        const data = new NS({
            serverId: guildIpsa.id,
            latestArticle: 'None',
        });
        await data.save();
        await getNews(data, guildIpsa, '880703535656878150');
    } else {
        console.log('Data found');
        await getNews(data, guildIpsa, '880703535656878150');
    }
    console.log('Article sending process ended');
};

export default new Event('ready', async () => {
    console.log(`Logged in as ${client.user?.tag}!`);

    try {
        await sendArticle();
        setInterval(sendArticle, 60 * 60 * 4 * 1000, {
            immediate: true,
        });
    } catch (error) {
        console.log('\n-----------------------------------');
        console.log('Event: ready.ts\nError: ' + 'BOT is not in the guild');
        console.log('-----------------------------------\n');
    }

    client.user?.setPresence({
        activities: [
            { name: '^_^ Click me!' },
            { name: 'PHEARION NETWORK', type: ActivityType.Competing },
        ],
        status: 'dnd',
    });
});
