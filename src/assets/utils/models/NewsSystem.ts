import mongoose, { Schema } from 'mongoose';
import { INewsDocument } from '../../../typings/MongoTypes';

const newsSchema = new Schema({
    serverId: String,
    latestArticle: String,
});

newsSchema.statics.findOneOrCreate = async function findOneOrCreate(
    this: mongoose.Model<INewsDocument>,
    filter: mongoose.FilterQuery<INewsDocument>,
    doc: mongoose.Document
) {
    const one = await this.findOne(filter);
    return one ?? (await this.create(doc));
};

const NewsModel = mongoose.connection
    .useDb('ipsa')
    .model('latest_news', newsSchema);

export default NewsModel;
