const dotenv = require('dotenv');

dotenv.config();
const Twit = require('twit');
const config = require('./config');

let T = new Twit(config);