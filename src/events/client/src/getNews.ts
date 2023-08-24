import axios from 'axios';
import cheerio from 'cheerio';
import {
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    Guild,
    GuildTextBasedChannel,
} from 'discord.js';
import { client } from '../../../index';

const sendNews = (
    title: string,
    image: string,
    desc: string,
    articleLink: string,
    guild: Guild,
    channelId: string
) => {
    const newsEmbed = new EmbedBuilder()
        .setColor('Random')
        .setTitle('BLOG IPSA')
        .setDescription(`**${title}**`)
        .addFields({ name: 'Excerpt/Extrait', value: `${desc}` })
        .setImage(image)
        .setTimestamp()
        .setFooter({
            text: 'A-News By Ania.',
            iconURL: client.user.displayAvatarURL(),
        });

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setURL(articleLink)
            .setLabel('-> FULL ARTICLE!')
    );

    const channel = guild.channels.cache.find(
        (ch) => ch.id === channelId
    ) as GuildTextBasedChannel;
    channel.send({ embeds: [newsEmbed], components: [row] });
};

const getNews = async (data, guild, channelId) => {
    try {
        const response = await axios.get('https://www.ipsa.fr/blogs/');

        if (response.status === 200) {
            const $ = cheerio.load(response.data);

            const blogPrime = $('.blog_prime');
            const articleLink = blogPrime.find('a')['0']['attribs']['href'];
            const image = $('source')['0']['attribs']['srcset'].split(',')[0];
            const title = $('.article_titre')
                .text()
                .match(/[^\r\n]+/g)[0];
            const desc = $('.article_excerpt')
                .text()
                .match(/[^\r\n]+/g)[0];

            if (!data) {
                sendNews(title, image, desc, articleLink, guild, channelId);
            } else if (data.latestArticle !== articleLink) {
                sendNews(title, image, desc, articleLink, guild, channelId);
                data.latestArticle = articleLink;
                await data.save();
            } else {
                console.log('No new articles');
            }
        }
    } catch (error) {
        console.error(error);
    }
};

export { getNews };
