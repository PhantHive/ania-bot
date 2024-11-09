import { ExtendedClient } from './structures/Client';
import dbConnect from './assets/utils/mongoose';
import { config } from 'dotenv';
import express from 'express';
import metricsRegistry from './metrics';
import http from 'http';

config();

// Start the server
startServer().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
});

export const client = new ExtendedClient();

const app = express();
const PORT = process.env.PORT || 4000;
const server = http.createServer(app);

// Graceful shutdown handler
async function gracefulShutdown(signal: string) {
    console.log(`\n${signal} signal received. Starting graceful shutdown...`);

    try {
        // Stop accepting new requests
        server.close(() => {
            console.log('HTTP server closed');
        });

        // Disconnect Discord client
        if (client) {
            await client.destroy();
            console.log('Discord client disconnected');
        }

        // Close MongoDB connection
        await dbConnect.disconnect();
        console.log('MongoDB connection closed');

        process.exit(0);
    } catch (error) {
        console.error('Error during graceful shutdown:', error);
        process.exit(1);
    }
}

// Error handling middleware
app.use(
    (
        err: Error,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {
        console.error('Express error:', err);
        res.status(500).send('Internal Server Error');
    }
);

// Metrics endpoint with error handling
app.get('/metrics', async (req, res) => {
    try {
        res.set('Content-Type', metricsRegistry.contentType);
        const metrics = await metricsRegistry.metrics();
        res.end(metrics);
    } catch (error) {
        console.error('Error serving metrics:', error);
        res.status(500).send('Error collecting metrics');
    }
});

// Main startup function
async function startServer() {
    try {
        // Connect to MongoDB first
        await dbConnect.init();
        console.log('MongoDB connected successfully');

        // Start Discord client
        await client.start();
        console.log('Discord client started successfully');

        // Start HTTP server
        await new Promise<void>((resolve) => {
            server.listen(PORT, () => {
                console.log(`Metrics server listening on port ${PORT}`);
                resolve();
            });
        });

        // Register shutdown handlers
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));

        // Global error handlers
        process.on('unhandledRejection', (reason, promise) => {
            console.error(
                'Unhandled Rejection at:',
                promise,
                'reason:',
                reason
            );
        });

        process.on('uncaughtException', (error) => {
            console.error('Uncaught Exception:', error);
            gracefulShutdown('UNCAUGHT_EXCEPTION').catch(console.error);
        });
    } catch (error) {
        console.error('Error during startup:', error);
        process.exit(1);
    }
}

// MongoDB connection error handler
dbConnect.getConnection().on('error', (error) => {
    console.error('MongoDB connection error:', error);
    gracefulShutdown('MONGODB_ERROR').catch(console.error);
});

// Health check endpoint
app.get('/health', (req, res) => {
    const healthcheck = {
        uptime: process.uptime(),
        message: 'OK',
        timestamp: Date.now(),
    };
    try {
        res.send(healthcheck);
    } catch (error) {
        healthcheck.message = error;
        res.status(503).send();
    }
});

// Export server instance for testing
export { server, app };
