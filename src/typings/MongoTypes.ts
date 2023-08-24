import MV from '../assets/utils/models/MailSystem';
import { Document, FilterQuery, Model } from 'mongoose';

interface StudentDocument extends Document {
    discordId: string;
    discordTag: string;
    firstName: string;
    secondName: string;
    promo: number;
    city: string;
    degree: string;
    assoArt: string[];
    assoSport: string[];
    assoTech: string[];
    email: string;
}

interface MailModel extends Model<StudentDocument> {
    findOneOrCreate: (
        this: Model<StudentDocument>,
        filter: FilterQuery<StudentDocument>,
        doc: StudentDocument
    ) => Promise<StudentDocument>;
}

export default MV as MailModel;
