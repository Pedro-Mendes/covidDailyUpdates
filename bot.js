/* https://rapidapi.com/KishCom/api/covid-19-coronavirus-statistics */
const dotenv = require('dotenv');
const axios = require('axios');

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
function scheduledTweet() {
  const date = new Date().toJSON().slice(0, 10).replace(/-/g, '/');
  let confirmedCases;
  getCorona()
    .then((res) => {
      confirmedCases = res.data.covid19Stats[0].confirmed;
      const tweet = {
        status: `${date}\n Brazil confirmed cases: ${confirmedCases}`,
      };
      T.post('statuses/update', tweet, tweeted);
    });
}

scheduledTweet();
setInterval(scheduledTweet, 1000 * 60 * 60);
