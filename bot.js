/* eslint-disable max-len */
/* eslint-disable no-console */
/* https://rapidapi.com/KishCom/api/covid-19-coronavirus-statistics
https://rapidapi.com/astsiatsko/api/coronavirus-monitor
https://www.youtube.com/user/shiffman
*/
const dotenv = require('dotenv');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

dotenv.config();
const URL = 'https://coronavirus-monitor.p.rapidapi.com/coronavirus/';
const countryList = ['Brazil', 'Italy', 'Iran', 'USA', 'China', 'Spain', 'Germany', 'France', 'UK', 'Canada', 'Portugal', 'Australia', 'Argentina', 'Venezuela', 'S. Korea', 'Ecuador'];

const Twit = require('twit');
const TwitterLite = require('twitter-lite');

const config = require('./config');
const configLite = require('./configLite');

const T = new Twit(config);
const TLite = new TwitterLite(configLite);

const axiosConfig = {
  method: 'GET',
  headers: {
    'x-rapidapi-host': 'coronavirus-monitor.p.rapidapi.com',
    'x-rapidapi-key': 'f3aaada3fdmsh01752c4dfa674acp12ea76jsnfe30e4023c44',
  },
};

let iteration = 0;

function tweeted(err, data, response) {
  if (err) {
    console.log('An error occurred: ', response);
  } else {
    console.log('All good');
  }
}

async function getCorona(conf) {
  const response = await axios(conf);
  return response.data;
}

async function getCasesByCountry() {
  axiosConfig.url = `${URL}cases_by_country.php`;
  axiosConfig.responseType = '';
  const response = await getCorona(axiosConfig);
  return response.countries_stat;
}

function postTweet(tweet) {
  TLite.post('statuses/update', { status: tweet.status })
    .then(() => console.log('Success!'))
    .catch((errLite) => {
      console.log('Err in twitter-lite:', errLite);
      T.post('statuses/update', tweet, tweeted)
        .then(() => console.log('Success!'))
        .catch((err) => console.log('Err in twit:', err));
    });
}

function stringToFloat(string) {
  return parseFloat(string.replace(',', ''));
}

// eslint-disable-next-line no-unused-vars
function uploaded(err, data, response) {
  const id = data.media_id_string;
  const tweet = { status: 'Take care of yourself ❤', media_ids: [id] };
  T.post('statuses/update', tweet, tweeted);
}

async function randomMask64() {
  const pathFile = path.resolve(__dirname, 'images', 'maskTmp.jpg');
  const writer = fs.createWriteStream(pathFile);

  axiosConfig.url = `${URL}random_masks_usage_instructions.php`;
  axiosConfig.responseType = 'stream';

  const response = await getCorona(axiosConfig);
  response.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', () => {
      resolve(fs.readFileSync(pathFile, 'base64'));
      fs.unlinkSync(pathFile);
    });
    writer.on('error', reject);
  });
}

function createTweetObject(allCountries, information, informationText) {
  const tweet = { status: informationText };
  const formatedData = [];
  countryList.forEach((name) => {
    const countryData = allCountries.filter((report) => report.country_name === name);
    formatedData.push({
      country: countryData[0].country_name,
      info: countryData[0][information],
    });
  });
  formatedData.sort((a, b) => ((stringToFloat(a.info) > stringToFloat(b.info)) ? 1 : -1));
  formatedData.forEach((data) => {
    tweet.status += `\n${data.country} - ${data.info}`;
  });
  return tweet;
}

const functionArray = [
  async function confirmedCases() {
    const allCountries = await getCasesByCountry();
    const tweet = createTweetObject(allCountries, 'cases', 'Confirmed cases:\n');
    postTweet(tweet);
  },
  async function deathNumbers() {
    const allCountries = await getCasesByCountry();
    const tweet = createTweetObject(allCountries, 'deaths', 'Confirmed deaths:\n');
    postTweet(tweet);
  },
  async function recoveredCases() {
    const allCountries = await getCasesByCountry();
    const tweet = createTweetObject(allCountries, 'total_recovered', 'Recovered cases:\n');
    postTweet(tweet);
  },
  async function postImage() {
    const b64content = await randomMask64();
    T.post('media/upload', { media_data: b64content }, uploaded);
  },
];

setInterval(async () => {
  await functionArray[iteration]();
  iteration += 1;
  iteration %= functionArray.length;
}, 1000 * 60 * 60 * 3);
