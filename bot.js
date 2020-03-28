/* https://rapidapi.com/KishCom/api/covid-19-coronavirus-statistics 
https://www.youtube.com/user/shiffman
*/
const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config();
const Twit = require('twit');
const TwitterLite = require('twitter-lite');

const config = require('./config');
const configLite = require('./configLite');

function tweeted(err, data, response) {
  if (err) {
    console.log('An error occurred: ', response);
  } else {
    console.log('All good');
  }
}

function getCorona() {
  return axios({
    method: 'GET',
    url: 'https://covid-19-coronavirus-statistics.p.rapidapi.com/v1/stats',
    headers: {
      'content-type': 'application/octet-stream',
      'x-rapidapi-host': 'covid-19-coronavirus-statistics.p.rapidapi.com',
      'x-rapidapi-key': 'f3aaada3fdmsh01752c4dfa674acp12ea76jsnfe30e4023c44',
    },
    params: {
      country: 'Brazil',
    },
  })
    .then((response) => response.data)
    .catch((error) => {
      console.log('Error with response: ', error);
    });
}

function postTweet(tweet) {
  let T = new TwitterLite(configLite);
  T.post('statuses/update', { status: tweet.status })
    .then(() => console.log('Success!'))
    .catch((errLite) => {
      console.log('Err in twitter-lite:', errLite);
      T = new Twit(config);
      T.post('statuses/update', tweet, tweeted)
        .then(() => console.log('Success!'))
        .catch((err) => console.log('Err in twit:', err));
    });
}

function scheduledTweet() {
  const date = new Date().toJSON().slice(0, 10).replace(/-/g, '/');
  let confirmedCases;
  getCorona()
    .then((res) => {
      confirmedCases = res.data.covid19Stats[0].confirmed;
      const tweet = {
        status: `${date}\n Brazil confirmed cases: ${confirmedCases}`,
      };
      postTweet(tweet);
    });
}

/* function scheduleTweetLite() {
  const T = new TwitterLite(configLite);
  T.post('statuses/update', { status: 'Hello, Worldfd!' })
    .then(() => console.log('Success!'))
    .catch((err) => console.log('Error: ', err));
} */

scheduledTweet();
setInterval(scheduledTweet, 1000 * 60 * 60 * 1);
