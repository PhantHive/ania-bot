import mongoose, { Schema } from 'mongoose';
import type { IStudentDocument } from '../../../typings/MongoTypes';

const studentSchema = new Schema({
    discordId: String,
    discordTag: String,
    firstName: String,
    secondName: String,
    promo: Number,
    city: String,
    degree: String,
    assoArt: [String],
    assoSport: [String],
    assoTech: [String],
    email: String,
});

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
