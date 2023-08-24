import mongoose, { Schema, Model } from 'mongoose';

const newsSchema = new Schema({
    serverId: String,
    latestArticle: String,
});

const NewsModel = mongoose.connection
    .useDb('ipsa')
    .model('latest_news', newsSchema);

export default NewsModel;
