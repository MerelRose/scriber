import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';

import GETroutes from './routes/get_routes.js';
import POSTroutes from './routes/post_routes.js';
import POSTroutesDB from './routes/post_db_routes.js';
import DELroutes from './routes/delete_routes.js';
import PUTroutes from './routes/put_routes.js';

import { Server } from 'socket.io';
import rateLimit from'express-rate-limit';

dotenv.config();

import jwt from 'jsonwebtoken';

const token = jwt.sign({
  id: 1,
  username: 'GFG'
}, process.env.JWT_SECRET, { expiresIn: '1h' });

console.log(token);

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use((req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (apiKey && apiKey === process.env.API_KEY) {
        next();
    } else {
        res.status(403).json({ error: 'Forbidden: Invalid API key' });
    }
});

const limiter = rateLimit({
    // min sec mil
    windowMs: 15 * 60 * 1000,
    max: 100, 
    message: "Too many requests from this IP, please try again after some time",
  });
  
  app.use(limiter);

app.use(express.json());
app.use('/', GETroutes);
app.use('/', POSTroutes);
app.use('/', POSTroutesDB);
app.use('/', DELroutes);
app.use('/', PUTroutes);
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.use(cors({
    origin: 'http://localhost:4000',
    methods: ['GET', 'POST'],
    credentials: true
}));

server.listen(4000, () => {
    console.log('Server draait op http://localhost:4000');
});

io.on('connection', (socket) => {
    console.log('Een client is verbonden via Socket.IO');

    socket.on('start_transcription', (data) => {
        console.log('Start transcriptie aangevraagd:', data);
    });
});

