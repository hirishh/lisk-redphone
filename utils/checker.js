import { makeCall } from "./caller";
const rp = require('request-promise-native');
const log = require('./log')('lisk-redphone:checker');

export const checkForgingIsEnabled = (apiCallRes) => {
  if (
      // No result from API
      !apiCallRes ||
      // No delegate set-up in config.json
      (apiCallRes && apiCallRes.data && apiCallRes.data.length === 0) ||
      // Forging is disabled
      (apiCallRes && apiCallRes.data && apiCallRes.data.length === 1 && apiCallRes.data[0].forging === false)
  ) {
    return false;
  }
  return true;
};

export const isAtLeastOneForging = async (results, callOnDoubleForging) => {
  let forgingNodes = [];

  for (let i=0; i  <results.length; i++) {
    const res = results[i];

    if(res instanceof Error) {
      log.debug(`Node ${res.url} is not reachable. ${res.errorMessage}`);
      continue;
    }

    if(res.isForgingEnabled()) {
      forgingNodes.push(res.url);
    }
  }

  if(forgingNodes.length > 1) {
    log.debug(`WARNING: Double Forging on following nodes: ${forgingNodes.join(', ')}`);
    if(callOnDoubleForging) {
      log.debug(`Call on Double Forging is active.`);
      await makeCall();
    }
  }

  return forgingNodes.length >= 1;
};

const mainnetUrl = 'https://node06.lisk.io:443';
const testnetUrl = 'https://testnet.lisk.io:443';

export const hasForgedRecently = async (checkItem) => {
  const params = {
    toTimestamp: Date.now(),
    fromTimestamp: Date.now() - 1000*60*40
  };
  const reqBody = await rp(`/api/delegates/${checkItem.delegateAddress}/forging_statistics`,
    {
      json: true,
      baseUrl: checkItem.isMainnet ? mainnetUrl : testnetUrl,
      qs: params
    });
  return reqBody && reqBody.data && parseInt(reqBody.data.count) !== 0;
};

const isValidAddress = address => {
  return address.length > 2 && address.length < 22 && address[address.length - 1] === 'L';
};

export const isCheckListProperlyFilled = (checkList) => {
  for (let i=0; i  <checkList.length; i++) {
    const checkItem = checkList[i];

    if (!checkItem.hasOwnProperty('label') || (checkItem.hasOwnProperty('label') && checkItem.label === "")) {
      log.error(`Label property is missing on checkList at position: ${i+1}.`);
      return false;
    }
    if (!checkItem.hasOwnProperty('delegateAddress')|| (checkItem.hasOwnProperty('delegateAddress') && !isValidAddress(checkItem.delegateAddress))) {
      log.error(`Delegate address format is wrong for ${checkItem.label}: ${checkItem.delegateAddress}`);
      return false;
    }
    if (!checkItem.hasOwnProperty('isMainnet')) {
      log.error(`isMainnet field is missing for ${checkItem.label}`);
      return false;
    }
    if (!checkItem.hasOwnProperty('nodes') || (checkItem.hasOwnProperty('nodes') && checkItem.nodes.length === 0)) {
      log.error(`You did not specify any node address for ${checkItem.label}`);
      return false;
    } else {
      for (let j=0; j < checkItem.nodes.length; j++) {
        if(checkItem.nodes[j] === "") {
          log.error(`Empty address is not valid on check ${checkItem.label}`);
          return false
        }
      }
    }
  }
  return true;
};