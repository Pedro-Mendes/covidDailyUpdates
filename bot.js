/* eslint-disable max-len */
/* eslint-disable no-console */
/* https://rapidapi.com/KishCom/api/covid-19-coronavirus-statistics
https://rapidapi.com/astsiatsko/api/coronavirus-monitor
https://www.youtube.com/user/shiffman
*/
const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config();
const Twit = require('twit');
const TwitterLite = require('twitter-lite');

const config = require('./config');
const configLite = require('./configLite');

let iteration = 0;
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
    url: 'https://coronavirus-monitor.p.rapidapi.com/coronavirus/cases_by_country.php',
    headers: {
      'content-type': 'application/octet-stream',
      'x-rapidapi-host': 'coronavirus-monitor.p.rapidapi.com',
      'x-rapidapi-key': 'f3aaada3fdmsh01752c4dfa674acp12ea76jsnfe30e4023c44',
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

function stringToFloat(string) {
  return parseFloat(string.replace(',', ''), 10);
}

const functionArray = [
  function confirmedCases() {
    getCorona()
      .then((res) => {
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
      });
  },
  function deathNumbers() {
    getCorona()
      .then((res) => {
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
      });
  },
  function recoveredCases() {
    getCorona()
      .then((res) => {
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
      });
  },
];

setInterval(() => {
  functionArray[iteration]();
  iteration += 1;
  iteration %= functionArray.length;
}, 1000 * 60 * 60 * 3);
