const config = require('config');
const log = require('./utils/log')('lisk-redphone:test-call');

const makeCall = async () => {
  log.debug('Making the call.');
  const accountSid = config.get('twilio.accountSid');
  const authToken = config.get('twilio.authToken');
  const client = require('twilio')(accountSid, authToken);
  await client.calls
    .create({
      url: 'http://demo.twilio.com/docs/voice.xml',
      to: config.get('call.to'),
      from: config.get('call.from')
    })
    .then(call => {
      log.debug('Call SID: ' + call.sid);
    })
    .catch((e) => {
      log.debug('Error during making the call! Error message: ' + e.message);
      console.info(e);
    });
};

(async () => {
  await makeCall();
})();