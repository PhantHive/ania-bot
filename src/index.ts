import { ExtendedClient } from './structures/Client';
import dbConnect from './assets/utils/mongoose';
require('dotenv').config();

export const client = new ExtendedClient();
dbConnect.init();

client.start();
