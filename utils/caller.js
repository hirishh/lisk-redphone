const config = require('config');
const log = require('./log')('lisk-redphone:caller');

const cooldown = config.get('cooldownInMinutes');
const dryrun = config.get('dry-run');
let lastNotification = 0;

const isDryRun = () => {
  if ( dryrun ) {
    log.debug('RED ALARM. But Dry-Run is active. No call!');
    return true;
  }
  return false;
};

const isCooldown = () => {
  if (lastNotification + 1000*60*cooldown > Date.now() ) {
    log.debug('Cooldown activated. Wait before a new call.');
    return true;
  }
  return false;
};

export const makeCall = async () => {
    if(isDryRun()) return;
    if(isCooldown()) return;
    log.debug('RED ALARM. Making the call.');
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
          lastNotification = Date.now();
        });
};