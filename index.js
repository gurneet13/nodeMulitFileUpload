const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: process.env.ENV_PATH || '.env' });
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const router = require('./router/router');
const createServer = require('http').createServer;


const { HTTP_PORT = 3015, HTTP_SERVER = "0.0.0.0" } = process.env;


const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use('/generic', router);
//app.use('/static', express.static(path.join(__dirname, 'private')));



const server = createServer(app);
server.listen(HTTP_PORT, HTTP_SERVER, () => {
  console.info(`Bert NLU Manager Server is now running on ${HTTP_SERVER}:${HTTP_PORT}`);
});

