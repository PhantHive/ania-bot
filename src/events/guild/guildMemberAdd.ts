import { Event } from '../../structures/Event';
import StudentModel from '../../assets/utils/models/MailSystem';
import { IStudentDocument } from '../../typings/MongoTypes';

const MV = StudentModel;

const promoToRole = {
    2028: 'aero1',
    2027: 'aero2',
    2026: 'aero3',
    2025: 'aero4',
    2024: 'aero5',
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
        const data: IStudentDocument = await MV.findOne({
            discordId: member.id,
        });

        if (data) {
            // Check if all required fields have values
            if (
                data.discordId &&
                data.emailData &&
                data.discordTag &&
                data.promo !== 0 &&
                data.degree &&
                data.city &&
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
