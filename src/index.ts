import { ExtendedClient } from './structures/Client';
import dbConnect from './assets/utils/mongoose';
import { config } from 'dotenv';
import express from 'express';
import metricsRegistry from './metrics';
import http from 'http'; // Step 1: Import the http module

config();

const app = express();
const PORT = process.env.PORT || 4000;

app.get('/metrics', async (req, res) => {
    res.set('Content-Type', metricsRegistry.contentType);
    res.end(await metricsRegistry.metrics());
});

const server = http.createServer(app);

export const client = new ExtendedClient();
dbConnect.init();

client.start();

server.listen(PORT, () => {
    console.log(`Metrics server listening on port ${PORT}`);
});
