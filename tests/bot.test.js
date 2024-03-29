require('../bot.js');

jest.mock('twit');
const Twit = require('twit');

describe('Testing bot.js', () => {
  test('Check if config was used to call Twit', () => {
    const expectedConfig = {
      consumer_key: process.env.CONSUMER_KEY,
      consumer_secret: process.env.CONSUMER_SECRET,
      access_token: process.env.ACCESS_TOKEN,
      access_token_secret: process.env.ACCESS_TOKEN_SECRET,
      timeout_ms: 60 * 1000, // optional HTTP request timeout to apply to all requests.
      strictSSL: true, // optional - requires SSL certificates to be valid.
    };
    expect(Twit).toHaveBeenCalledWith(expectedConfig);
  });
});
