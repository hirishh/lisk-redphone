import {
  checkForgingIsEnabled,
  hasForgedRecently,
  isAtLeastOneForging,
  isCheckListProperlyFilled } from './utils/checker'
import { makeCall } from "./utils/caller";
import { NodeApiNotReachable } from "./utils/errors";
const rp = require('request-promise-native');
const pMap = require('p-map');
const config = require('config');
const Repeat = require('repeat');
const log = require('./utils/log')('lisk-redphone:main');

class NodeApiResult {
  constructor(url, restResult) {
    this.url = url;
    this.restResult = restResult;
  }

  isForgingEnabled() {
    return checkForgingIsEnabled(this.restResult);
  }
}

const urlForgingResolver = async baseUrl => {
  try {
    const reqBody = await rp('/api/node/status/forging', { baseUrl, json: true, rejectUnauthorized: false } );
    return new NodeApiResult(baseUrl, reqBody);
  } catch (e) {
    return new NodeApiNotReachable(baseUrl, e.message);
  }
};

const checkList = config.get('checkList');
if(!isCheckListProperlyFilled(checkList)) {
  process.exit(0);
}



const doJob = async () => {

  for (let i=0; i  <checkList.length; i++) {
    const checkItem = checkList[i];

    //Check if in the last 35 min the specified delegate has forged at least 1 block
    try {
      if(!await hasForgedRecently(checkItem)) {
        log.debug(`No block forged in the last 40 min for ${checkItem.label}`);
        await makeCall();
        continue;
      }
    } catch (e) {
      // It happens only when the official endpoint is down... should be temporary.
      log.error(`Error during check forged block in the last 40 min for ${checkItem.label} and delegate address ${checkItem.delegateAddress}.`);
      log.error(e.message);
      log.error(`Please check your delegate address is correct in the config. Let's continue with node checks...`);
    }

    // Now Check all the nodes if at least one ha forging enabled
    try {
      const results = await pMap(checkItem.nodes, urlForgingResolver, {concurrency: 2});
      const callOnDoubleForging = checkItem.hasOwnProperty('callOnDoubleForging') ? checkItem.callOnDoubleForging : false;
      if(!await isAtLeastOneForging(results, callOnDoubleForging)) {
        log.debug(`No node is forging for ${checkItem.label}!!1!`);
        await makeCall();
      }
    } catch(e) {
      throw new Error('Error during check job. ' + e.message );
    }
  }
};


const onSuccess = () => {};
const onProgress = () => {};
const onFailure = (ex) => {
  log.error("Exception: ", ex);
};

log.debug('Configuration is ok. Starting Repeater...');
Repeat( function() {
  doJob();
})
.every(config.get('checkFrequencyInMinutes'), 'min')
.start()
.then(onSuccess, onFailure, onProgress);
log.debug('RedPhone is active. I hope I will not call you... ;)');