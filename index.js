const axios = require('axios');
const config = require('config');
const Repeat = require('repeat');
const log = require('./utils/log')('lisk-redphone');

let lastNotification = 0;
const cooldown = config.get('cooldownInMinutes');
const port =  config.get('isTestnet') ? 7000 : 8000;

const isCooldown = () => {
  if (lastNotification + 1000*60*cooldown > Date.now() ) {
    log.debug('Cooldown activated. Wait before a new call.');
    return true;
  }
  return false;
};

const makeCall = async () => {

  const accountSid = config.get('twilio.accountSid');
  const authToken = config.get('twilio.authToken');
  const client = require('twilio')(accountSid, authToken);
  await client.calls
    .create({
      url: 'http://demo.twilio.com/docs/voice.xml',
      to: config.get('call.to'),
      from: config.get('call.from')
    })
    .then(call => log.debug('Call SID: ' + call.sid));
};

const redPhoneCall = async () => {
  if(isCooldown()) return;
  log.debug('Not Forging. RED ALARM. Making the call.');
  await makeCall();
  lastNotification = Date.now();
  return true;
};

let apiDownCounter = 0;
const check = async () => {
  try {
    const { data } = await axios.get('http://localhost:' + port + '/api/node/status/forging');
    apiDownCounter = 0;
    if ( !data || // No result from API
         (data && data.data && data.data.length === 0 ) || // No delegate set-up in config.json
         (data && data.data && data.data.length === 1 && data.data[0].forging === false) // Forging is disabled
    ) {
      await redPhoneCall();
      return;
    }
    log.debug('Everything is fine.');
  } catch (e) {
    log.debug('Node is not reachable.');
    if(isCooldown()) return;
    if(apiDownCounter <= 2) { // In case of restarts it gives max 3 mins to lisk node to recover
      apiDownCounter++;
      log.debug('Node is not reachable. Attempt: ' + apiDownCounter);
      return;
    }
    await redPhoneCall();
    return;
  }
};


const onSuccess = () => {};
const onProgress = () => {};
const onFailure = (ex) => {
  log.error("Exception: ", ex);
};

log.debug('Starting Repeater...');
Repeat( function() {
  check();
})
.every(config.get('frequencyInMinutes'), 'min')
.start()
.then(onSuccess, onFailure, onProgress);