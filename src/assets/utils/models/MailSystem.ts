import mongoose, { Schema } from 'mongoose';

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

const StudentModel = mongoose.connection
    .useDb('ipsa_students')
    .model('Student', studentSchema);

export default StudentModel;
