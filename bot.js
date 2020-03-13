const dotenv = require('dotenv');

dotenv.config();
const Twit = require('twit');
const config = require('./config');

const T = new Twit(config);

function tweeted(err, data, response) {
  if (err) {
    console.log('An error occurred: ', response);
  } else {
    console.log('All good');
  }
}
function scheduledTweet() {
  const date = new Date(); // for now
  const dateString = `Agora são ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
  const tweet = {
    status: dateString,
  };
  T.post('statuses/update', tweet, tweeted);
}

scheduledTweet();
setInterval(scheduledTweet, 1000 * 10);
