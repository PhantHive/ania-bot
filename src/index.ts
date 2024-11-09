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

// Retry configuration
const RETRY_DELAYS = [1000, 2000, 5000, 10000, 30000]; // Increasing delays between retries
const MAX_RETRIES = 5;

// Enhanced async retry function
async function withRetry<T>(
    operation: () => Promise<T>,
    name: string,
    retryCount = 0
): Promise<T> {
    try {
        return await operation();
    } catch (error) {
        if (retryCount >= MAX_RETRIES) {
            console.error(
                `Failed to ${name} after ${MAX_RETRIES} attempts:`,
                error
            );
            throw error;
        }

        const delay = RETRY_DELAYS[retryCount];
        console.warn(`${name} failed, retrying in ${delay}ms...`, error);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return withRetry(operation, name, retryCount + 1);
    }
}

// Graceful shutdown handler
async function gracefulShutdown(signal: string) {
    console.log(`\n${signal} signal received. Starting graceful shutdown...`);
    let exitCode = 0;

    try {
        // Create a promise that resolves when the server closes
        const serverClosed = new Promise<void>((resolve) => {
            server.close(() => {
                console.log('HTTP server closed');
                resolve();
            });
        });

        // Parallel shutdown of services with timeout
        await Promise.race([
            Promise.all([
                // Disconnect Discord client
                client
                    ?.destroy()
                    .then(() => console.log('Discord client disconnected')),
                // Close MongoDB connection
                dbConnect
                    .disconnect()
                    .then(() => console.log('MongoDB connection closed')),
                // Wait for server to close
                serverClosed,
            ]),
            // Timeout after 10 seconds
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Shutdown timeout')), 10000)
            ),
        ]);
    } catch (error) {
        console.error('Error during graceful shutdown:', error);
        exitCode = 1;
    } finally {
        process.exit(exitCode);
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

// Enhanced startup function with retry logic
async function startServer() {
    try {
        // Connect to MongoDB with retry
        await withRetry(async () => {
            await dbConnect.init();
            console.log('MongoDB connected successfully');
        }, 'connect to MongoDB');

        // Start Discord client with retry
        await withRetry(async () => {
            await client.start();
            console.log('Discord client started successfully');
        }, 'start Discord client');

        // Start HTTP server
        await new Promise<void>((resolve, reject) => {
            server.on('error', (error) => {
                console.error('Server error:', error);
                reject(error);
            });

            server.listen(PORT, () => {
                console.log(`Metrics server listening on port ${PORT}`);
                resolve();
            });
        });

        // Register shutdown handlers
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));

        // Enhanced error handlers
        process.on('unhandledRejection', (reason, promise) => {
            console.error('Unhandled Rejection at:', {
                promise,
                reason,
                stack: reason instanceof Error ? reason.stack : undefined,
            });
        });

        process.on('uncaughtException', (error) => {
            console.error('Uncaught Exception:', {
                error,
                stack: error.stack,
            });
            gracefulShutdown('UNCAUGHT_EXCEPTION').catch(console.error);
        });
    } catch (error) {
        console.error('Fatal error during startup:', error);
        await gracefulShutdown('STARTUP_FAILURE');
    }
}

// Enhanced MongoDB error handler
let isShuttingDown = false;
dbConnect.getConnection().on('error', async (error) => {
    console.error('MongoDB connection error:', error);
    if (!isShuttingDown) {
        isShuttingDown = true;
        await gracefulShutdown('MONGODB_ERROR');
    }
});

// Health check endpoint with detailed status
app.get('/health', async (req, res) => {
    const healthcheck = {
        uptime: process.uptime(),
        message: 'OK',
        timestamp: Date.now(),
        services: {
            mongodb:
                dbConnect.getConnection().readyState === 1
                    ? 'connected'
                    : 'disconnected',
            discord: client.isReady() ? 'connected' : 'disconnected',
        },
    };

    try {
        if (
            healthcheck.services.mongodb === 'disconnected' ||
            healthcheck.services.discord === 'disconnected'
        ) {
            throw new Error('One or more services disconnected');
        }
        res.send(healthcheck);
    } catch (error) {
        healthcheck.message =
            error instanceof Error ? error.message : 'Error checking health';
        res.status(503).send(healthcheck);
    }
});

// Start the server with proper error handling
startServer().catch(async (error) => {
    console.error('Fatal error during startup:', error);
    process.exit(1);
});

export { server, app };
