import { Document } from 'mongoose';

export interface IStudentDocument extends Document {
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

export interface INewsDocument extends Document {
    serverId: string;
    latestArticle: string;
}
