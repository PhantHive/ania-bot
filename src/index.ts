import { ExtendedClient } from './structures/Client';
import dbConnect from './assets/utils/mongoose';
import { config } from 'dotenv';
import express from 'express';
import metricsRegistry from './metrics';
import http from 'http';

config();

const app = express();
const PORT = process.env.PORT || 4000;
const server = http.createServer(app);

export const client = new ExtendedClient();

// Simplified connection manager
class ConnectionManager {
    constructor(private client: ExtendedClient) {}

    async connect() {
        try {
            await this.client.start(); // Changed to await here
            console.log('Discord client connected successfully');
            console.log('Hi ☀️ I am LUCKY, your personal assistant');
        } catch (error) {
            console.error('Failed to connect Discord client:', error);
            throw error;
        }
    }

    async disconnect() {
        try {
            await this.client.destroy();
            console.log('Discord client disconnected');
        } catch (error) {
            console.error('Error disconnecting client:', error);
            throw error;
        }
    }
}

const connectionManager = new ConnectionManager(client);

// Basic health and metrics endpoints
app.get('/metrics', async (req, res) => {
    try {
        res.set('Content-Type', metricsRegistry.contentType);
        res.end(await metricsRegistry.metrics());
    } catch (error) {
        res.status(500).send('Error collecting metrics');
    }
});

app.get('/health', (req, res) => {
    res.send({
        status: 'OK',
        discord: client.isReady() ? 'connected' : 'disconnected',
        mongodb: dbConnect.getConnection().readyState === 1,
    });
});

// Start server and services
async function startServer() {
    try {
        await dbConnect.init();
        await connectionManager.connect();

        server.listen(PORT, () => {
            console.log(`Server listening on port ${PORT}`);
        });

        process.on('SIGTERM', () => {
            server.close();
            connectionManager.disconnect();
            dbConnect.disconnect();
            process.exit(0);
        });
    } catch (error) {
        console.error('Startup error:', error);
        process.exit(1);
    }
}

startServer();

export { server, app };
