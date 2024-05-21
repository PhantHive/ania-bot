import mongoose, { ConnectOptions } from 'mongoose';

// Create interface for connections options
interface DbConnectOptions extends ConnectOptions {
    autoIndex: boolean;
    connectTimeoutMS: number;
    maxPoolSize: number;
    family: number;
}

const dbConnect = {
    init: async () => {
        const options: DbConnectOptions = {
            autoIndex: false,
            connectTimeoutMS: 70000,
            maxPoolSize: 100,
            family: 4,
        };

        await mongoose.connect(
            `mongodb+srv://PhantHive:${process.env.DB}@iris.txxhe.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`,
            options
        );

        mongoose.Promise = global.Promise;

        mongoose.connection.on('connected', () => {
            console.log('Connected to MongoDB!');
        });

        mongoose.connection.on('error', (error) => {
            console.error('MongoDB Connection Error: ', error);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('Disconnected from MongoDB');
        });
    },
};

export default dbConnect;
