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

const Twit = require('twit');
const TwitterLite = require('twitter-lite');

const config = require('./config');
const configLite = require('./configLite');

const T = new Twit(config);
const TLite = new TwitterLite(configLite);
const axiosConfig = {
  url: 'https://coronavirus-monitor.p.rapidapi.com/coronavirus/',
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
  return parseFloat(string.replace(',', ''), 10);
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

const functionArray = [
  async function confirmedCases() {
    axiosConfig.url = `${URL}cases_by_country.php`;
    axiosConfig.responseType = '';
    const res = await getCorona(axiosConfig);
    const formatedData = [];
    const tweet = { status: 'Confirmed cases:\n' };
    const countryList = ['Brazil', 'Italy', 'Iran', 'USA', 'China', 'Spain', 'Germany', 'France', 'UK', 'Canada', 'Portugal', 'Australia', 'Argentina', 'Venezuela', 'Switzerland', 'S. Korea'];
    const allCountries = res.countries_stat;
    countryList.forEach((name) => {
      const countryData = allCountries.filter((report) => report.country_name === name);
      formatedData.push({
        country: countryData[0].country_name,
        cases: countryData[0].cases,
      });
    });
    formatedData.sort((a, b) => ((stringToFloat(a.cases) > stringToFloat(b.cases)) ? 1 : -1));
    formatedData.forEach((data) => {
      tweet.status += `\n${data.country} - ${data.cases}`;
    });
    console.log(tweet.status);
    postTweet(tweet);
  },
  async function deathNumbers() {
    axiosConfig.url = `${URL}cases_by_country.php`;
    axiosConfig.responseType = '';
    const res = await getCorona(axiosConfig);
    const formatedData = [];
    const tweet = { status: 'Confirmed deaths:\n' };
    const countryList = ['Brazil', 'Italy', 'Iran', 'USA', 'China', 'Spain', 'Germany', 'France', 'UK', 'Canada', 'Portugal', 'Australia', 'Argentina', 'Venezuela', 'Switzerland', 'S. Korea'];
    const allCountries = res.countries_stat;
    countryList.forEach((name) => {
      const countryData = allCountries.filter((report) => report.country_name === name);
      formatedData.push({
        country: countryData[0].country_name,
        deaths: countryData[0].deaths,
      });
    });
    formatedData.sort((a, b) => ((stringToFloat(a.deaths) > stringToFloat(b.deaths)) ? 1 : -1));
    formatedData.forEach((data) => {
      tweet.status += `\n${data.country} - ${data.deaths}`;
    });
    console.log(tweet.status);
    postTweet(tweet);
  },
  async function recoveredCases() {
    axiosConfig.url = `${URL}cases_by_country.php`;
    axiosConfig.responseType = '';
    const res = await getCorona(axiosConfig);
    const formatedData = [];
    const tweet = { status: 'Recovered cases:\n' };
    const countryList = ['Brazil', 'Italy', 'Iran', 'USA', 'China', 'Spain', 'Germany', 'France', 'UK', 'Canada', 'Portugal', 'Australia', 'Argentina', 'Venezuela', 'Switzerland', 'S. Korea'];
    const allCountries = res.countries_stat;
    countryList.forEach((name) => {
      const countryData = allCountries.filter((report) => report.country_name === name);
      formatedData.push({
        country: countryData[0].country_name,
        total_recovered: countryData[0].total_recovered,
      });
    });
    formatedData.sort((a, b) => ((stringToFloat(a.total_recovered) > stringToFloat(b.total_recovered)) ? 1 : -1));
    formatedData.forEach((data) => {
      tweet.status += `\n${data.country} - ${data.total_recovered}`;
    });
    console.log(tweet.status);
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
