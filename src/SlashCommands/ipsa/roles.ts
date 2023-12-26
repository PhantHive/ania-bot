import { SlashCommand } from '../../structures/SlashCommand';
import { TextChannel } from 'discord.js';

import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    StringSelectMenuBuilder,
    AttachmentBuilder,
} from 'discord.js';

interface AssoInfo {
    label: string;
    emoji: string;
    value: string;
}

async function fetchInfos<T>(
    values: T[],
    fetcher: (value: T) => Promise<AssoInfo>
) {
    const promises = values.map(fetcher);
    return await Promise.all(promises);
}

async function getPromoInfo(id: string) {
    return getAssoInfo(id, true);
}

const getAssoInfo = async (
    asso: string,
    isPromo: boolean = false
): Promise<AssoInfo> =>
    new Promise((resolve) => {
        /*
    [^-]*    Matches any number of characters just not -
    :\s*    Matches a : and any number of spaces
    {2}     Repeats what is in the ( ) 2 times.
    \K      Resets the match, and only keeps the rest.
    (.*)>       Matches the rest of the string before >. (Your match)
     */

        const emoji = asso.match(/(?:[^-]*:\s*){2}(.*)>/)[1];
        let assoName: string | string[] = asso.match(/<:(.*):/).pop();

        if (!isPromo) {
            assoName = assoName.replace(/[0-9]/g, '');
        }

        assoName = assoName.toLowerCase();

        resolve({
            label: assoName,
            emoji: emoji,
            value: assoName,
        });
    });

exports.default = new SlashCommand({
    name: 'create-ipsa-menu',
    description: 'Create role menu',
    userPermissions: ['Administrator'],
    run: async ({ interaction }) => {
        let menuAssoTech: AssoInfo[] = [];
        let menuAssoSport: AssoInfo[] = [];
        let menuAssoArt: AssoInfo[] = [];
        let menuPromo: AssoInfo[] = [];

        const assoTech = [
            '<:scrypt:1136401260032036955>',
            '<:Flight:883405356389265428>',
            '<:AeroIpsa:883101019209359360>',
            '<:Mach01:883289945874260058>',
            '<:ONE:883104155235934238>',
            '<:Novation:883405284238848010>',
            '<:Vega:883405306615463946>',
            '<:IPL:883405294116417546>',
            '<:AeroRC:883104088647151626>',
            '<:ITech:883405270347300885>',
            '<:Aircraft:883446611366268950>',
            '<:ISS:883104114618269736>',
        ];

        const assoSport = [
            '<:BDS:883279361103503380>',
            '<:Boulips:883409159884767352>',
            '<:WAX:883269746760511498>',
            '<:Avalanche:883399900203712544>',
            '<:SpaceRiders:883104170280906822>',
            '<:Kart:883286872397332522>',
            '<:Sail:883283853551222854>',
            '<:PARA:883276335156449290>',
            '<:Airsoft:883284848201039894>',
        ];

        const assoArt = [
            '<:BDJ:889608287857803304>',
            '<:AeroSociety:883405344355799040>',
            '<:POKER:883274374759723058>',
            '<:BDA:883287688755679272>',
            '<:Dreamage:883104191747338240>',
            '<:IISA:883446599966158849>',
            '<:BDE:883405332985032774>',
            '<:StudAct:883280385449000971>',
            '<:Consult:883405918103044126>',
        ];

        const promos = [
            '<:2022:883459321168527461>',
            '<:2023:883459278864777316>',
            '<:2024:883458166032056381>',
            '<:2025:883458133366816838>',
            '<:2026:883457572596760596>',
            '<:2027:1032634284349083699>',
            '<:2028:1136702657768194058>',
        ];

        try {
            menuAssoTech = await fetchInfos(assoTech, getAssoInfo);
            menuAssoSport = await fetchInfos(assoSport, getAssoInfo);
            menuAssoArt = await fetchInfos(assoArt, getAssoInfo);
            menuPromo = await fetchInfos(promos, getPromoInfo);

            console.log(menuPromo);
        } catch (error) {
            console.log(error);
        }

        // create discord embed builder
        const attachment = new AttachmentBuilder(
            './src/assets/image/logo/ipsa_logo.png',
            { name: 'ipsa.png' }
        );
        const embed = new EmbedBuilder()
            .setTitle('Choisis tes rôles')
            .setDescription('Choose your roles')
            .addFields(
                {
                    name: '🛠️ Technique',
                    value: 'Max 2',
                    inline: true,
                },
                {
                    name: '🏆️ Sport',
                    value: 'Max 3',
                    inline: true,
                },
                {
                    name: '🎨 Art',
                    value: 'Max 3',
                    inline: true,
                }
            )
            .setColor('#000000')
            .setImage('attachment://ipsa.png')
            .setTimestamp();

        const rowTech =
            new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('assos-tech')
                    .setPlaceholder('🛠️ Assos technique')
                    .setMaxValues(2)
                    .setOptions([
                        ...menuAssoTech,
                        {
                            label: 'Aucune',
                            value: 'no-tech',
                        },
                    ])
            );

        const rowSport =
            new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('assos-sport')
                    .setPlaceholder('🏆️ Assos sport')
                    .setMaxValues(3)
                    .setOptions([
                        ...menuAssoSport,
                        {
                            label: 'Aucune',
                            value: 'no-sport',
                        },
                    ])
            );

        const rowFun =
            new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('assos-art')
                    .setPlaceholder('🎨 Assos art (fun/culture...)')
                    .setMaxValues(3)
                    .setOptions(...menuAssoArt, {
                        label: 'Aucune',
                        value: 'no-art',
                    })
            );

        const rowPromo =
            new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('promotion')
                    .setPlaceholder('🎓 Promotion')
                    .setMaxValues(1)
                    .setOptions(...menuPromo)
            );

        const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId('ipsa-roles')
                .setLabel('CONFIRMER')
                .setStyle(ButtonStyle.Success)
        );

        const channel = interaction.guild.channels.cache.find(
            (ch) => ch.id === '1043548987749310534'
        ) as TextChannel;

        await channel.send({
            embeds: [embed],
            components: [rowTech, rowSport, rowFun, rowPromo, actionRow],
            files: [attachment],
        });
    },
});
