// dbConnect.ts
import mongoose, { ConnectOptions } from 'mongoose';

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
            connectTimeoutMS: 300000,
            maxPoolSize: 100,
            family: 4,
        };

        await mongoose.connect(process.env.DB_URI as string, options);

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

    // Add disconnect method
    disconnect: async () => {
        try {
            await mongoose.connection.close();
            console.log('MongoDB connection closed successfully');
        } catch (error) {
            console.error('Error closing MongoDB connection:', error);
            throw error;
        }
    },

    // Add getConnection method
    getConnection: () => mongoose.connection,
};

export default dbConnect;
