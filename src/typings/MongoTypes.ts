import { Document } from 'mongoose';

export interface IStudentDocument extends Document {
    discordId: string;
    discordTag: string;
    promo: number;
    city: string;
    degree: string;
    assoArt: string[];
    assoSport: string[];
    assoTech: string[];
    emailData?: {
        hash: string;
        salt: string;
    };
    isVerified: boolean;
    verifiedAt?: Date;
    pendingVerification?: {
        code: string;
        expiresAt: Date;
        emailData: {
            hash: string;
            salt: string;
        };
    };
    securityLock?: {
        lockedAt: Date;
        reason: string;
        expiresAt: Date;
    };
}

export interface INewsDocument extends Document {
    serverId: string;
    latestArticle: string;
}
