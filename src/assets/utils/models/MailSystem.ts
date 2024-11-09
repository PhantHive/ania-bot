import mongoose, { Schema } from 'mongoose';
import type { IStudentDocument } from '../../../typings/MongoTypes';

const studentSchema = new Schema(
    {
        discordId: String,
        discordTag: String,
        promo: Number,
        city: String,
        degree: String,
        assoArt: [String],
        assoSport: [String],
        assoTech: [String],
        emailData: {
            hash: String,
            salt: String,
        },
        isVerified: Boolean,
        verifiedAt: Date,
        pendingVerification: {
            code: String,
            expiresAt: Date,
            emailData: {
                hash: String,
                salt: String,
            },
        },
        securityLock: {
            lockedAt: Date,
            reason: String,
            expiresAt: Date,
        },
    },
    { timestamps: true }
);

studentSchema.statics.findOneOrCreate = async function findOneOrCreate(
    this: mongoose.Model<IStudentDocument>,
    filter: mongoose.FilterQuery<IStudentDocument>,
    doc: mongoose.Document
) {
    const one = await this.findOne(filter);
    return one ?? (await this.create(doc));
};

const StudentModel = mongoose.connection
    .useDb('ipsa_students')
    .model('Student', studentSchema);

export default StudentModel;
