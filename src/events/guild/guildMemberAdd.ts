import { Event } from '../../structures/Event';
import MV from '../../typings/MongoTypes';

const promoToRole = {
    28: 'aero1',
    27: 'aero2',
    26: 'aero3',
    25: 'aero4',
    24: 'aero5',
};

async function assignPromoRole(member, promo) {
    const roleName = promoToRole[promo];

    if (roleName) {
        const role = member.guild.roles.cache.find((r) => r.name === roleName);

        if (role) {
            await member.roles.add(role);
        }
    }
}

const checkMemberData = async (member) => {
    try {
        // Check if Student data exists in the database
        const data = await MV.findOne({ discordId: member.id });

        if (data) {
            // Check if all required fields have values
            if (
                data.discordId &&
                data.email &&
                data.discordTag &&
                data.promo !== 0 &&
                data.degree &&
                data.city &&
                data.firstName &&
                data.secondName &&
                data.assoArt &&
                data.assoSport &&
                data.assoTech
            ) {
                // Assign promo role
                await assignPromoRole(member, data.promo);
            }
        }
    } catch (error) {
        // Handle errors here, e.g., log them or notify administrators
        console.error('Error in checkMemberData:', error);
    }
};

export default new Event('guildMemberAdd', async (member) => {
    if (member.user.bot) return;

    try {
        await checkMemberData(member);
    } catch (error) {
        // Handle errors here, e.g., log them or notify administrators
        console.error('Error in guildMemberAdd event:', error);
    }
});
