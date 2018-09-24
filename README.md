![Alt text](logo.png?raw=true "Title")

Lisk Red Phone is an utility for Lisk Delegates that makes real phone call when the forging node is not forging anymore.

This tool is checking:
- Your delegate has forged at least 1 block in the last 40 minutes
- In all the specified nodes, at least one has forging enabled.
- Double Forging. In this case the call is executed only if specified in the config

### Pre-Requisite ###

- [Install Node.js V8 or above](https://nodejs.org/download/).
- Create a Twilio Account at [www.twilio.com](https://www.twilio.com/).
- Create a `Phone Number` project (under Products section)
- On the project dashboard, click on `Get a Number` and create a new Twilio Number
- A **trial Twilio account is enough**, you'll receive a call with a "demo" audio file.

### Set-up ###

1. Clone this repository: `git clone https://github.com/hirishh/lisk-redphone.git`
2. `cd lisk-redphone`
3. `npm install`
4. Set the required information on `config/default.json`. Check the Config section in this readme.
5. `npm run build`
6. Run `DEBUG=lisk-redphone* npm start` to check everything is ok. Quit the software with CTRL+C.
7. To test the call, run `DEBUG=lisk-redphone* npm run test-call`. It will help you to configure twilio in case of errors.
8. Install pm2 if not installed: `sudo npm i -g pm2`
9. Finally run it with PM2: `pm2 start app.json`
10. For the automatic startup, follow "Automatic startup with PM2" section.

#### Some Advices:
- Try and check if everything is working by setting `dry-run: true` on your config. 
In this way all the checks are executed but without doing any phone call.
- If you want to test that the Twilio Api/Phone Call is working, simply run `DEBUG=lisk-redphone* npm run test-call`.

NB: There is a billing process on twilio on every call, but at the moment they never asked me to pay (and it's maximum a couple of bucks).

##### Very Important: make sure the ip of the machine running redphone is whitelisted on your nodes (under api and forging in your config.json)!

### Config ###

Before running your RedPhone alert you need to set-up the config file on `config/default.json`.

```json
{
  "dry-run": false,
  "twilio": {
    "accountSid": "<ACCOUNT SID>",
    "authToken": "<AUTH TOKEN>"
  },
  "call": {
    "from": "<YOUR TWILIO NUMBER>",
    "to": "<YOUR MOBILE NUMBER WITH COUNTRY PREFIX (ex +1 123 345 67 89)>"
  },
  "checkFrequencyInMinutes": 1,
  "cooldownInMinutes": 15,
  "checkList": [
    {
      "label": "<LABEL FOR THIS CHECK: ex. Lisk Testnet>",
      "delegateAddress": "<YOUT DELEGATE ADDRESS>",
      "isMainnet": false,
      "nodes": ["http://localhost:7000"]
    },
    {
      "label": "<LABEL FOR THIS CHECK: ex. Lisk Mainnet Cluster>",
      "delegateAddress": "<YOUT DELEGATE ADDRESS>",
      "isMainnet": true,
      "callOnDoubleForging": true,
      "nodes": ["http://10.10.10.10:8000", "http://11.12.13.14:8000"]
    },
    ...
    ...
    ...
  ]
}
```

Legend:
- `dry-run`: **(bool)** If true, the script will execute the checks but it avoids to do the real phone call. Useful for tests.
- `twilio.*`: **(string)** Check your twilio dashboard for your SID and authToken.
- `call.from`: **(string)** Your twilio telephone number. 
- `call.to`: **(string)** Your mobile number. 
- `checkFrequencyInMinutes`: **(int)** How often the script must check that everything is ok. 
- `cooldownInMinutes`: **(int)** The minimum time between 2 consecutive calls. 
- `checkList`: **(object)** A list of node (or group of nodes) you want to check.
    - `label`: **(string)** A label to easly identify the nature of the node(s) (ex. testnet, mainnet, etc..)
    - `delegateAddress`: **(string)** The delegate address. It's used to check if there are forged blocks in the last 40 min. 
    - `isMainnet`: **(bool)** specify if this specific check is on Lisk Mainnet or not (Testnet). 
    - `callOnDoubleForging`: **(string)** (optional) if true, it will call you also in case of double forging (2+ nodes with forging enabled). 
    - `nodes`: **(array of string)** A list of urls of your nodes (active + fail-overs one for example).
    
If you specify multiple `nodes`, the script is going to check that **at least one** has forging enabled

##### Very Important: make sure the ip of the machine running redphone is whitelisted on your nodes (under api and forging in your config.json)!

### Run with PM2 ###

Prerequisites: you are done with the first 5 steps of Set-up process and you have pm2 installed (`sudo npm i -g pm2`)

Starting
```
pm2 start app.json
```

Checking logs
```
pm2 logs lisk-redphone
```

Stopping
```
pm2 stop lisk-redphone
```

### Update the software ###

In order to update the Lisk Redphone, follow these intructions:

1. Save your config (`config/default.json`) somewhere outside Lisk Redphone folder.
3. `git reset --hard HEAD`
4. `git pull`
5. Re-configure again the configuration. NB: it's better to avoid to copy-paste the old configuration. Re-fill the information manually.
6. `npm install`
7. `npm run build`
8. (optional) Check again everything is working with `dry-run:true` and following points 6 and 7 of the Set-up quide
9. `pm2 restart lisk-redphone`


### Automatic startup with PM2 ###

Let pm2 detect available init system, generate configuration and enable startup system:

```
pm2 startup
```

Now follow the instruction. For example on ubuntu 14.04 LTE (with systemd as default init system) :

```
[PM2] Init System found: systemd
[PM2] To setup the Startup Script, copy/paste the following command:
sudo env PATH=$PATH:/usr/bin /usr/local/lib/node_modules/pm2/bin/pm2 startup systemd -u [user] --hp /home/[user]
```

Copy-paste the command that PM2 is suggesting (sudo env PATH...). Now, *if you didn't before*, run the application with ```pm2 start app.json``` and then:
```
pm2 save
```

This last command will save the process list and execute them on reboot.

If you want to remove the init script, execute:
```
pm2 unstartup [initsystem]
```

For more information:  [Official PM2 Startup Script page](http://pm2.keymetrics.io/docs/usage/startup/#generating-a-startup-script)

### License ###

If you distribute this project in part or in full, please attribute with a link to [the GitHub page](https://github.com/hirishh/lisk-redline). This software is available under the MIT License, details in the included `LICENSE.md` file.