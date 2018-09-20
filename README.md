![Alt text](logo.png?raw=true "Title")

Lisk Red Phone is an utility for Lisk Delegates that makes real phone call when the forging node is not forging anymore.

### Pre-Requisite ###

- [Install Node.js](https://nodejs.org/download/).
- Create a Twilio Account at [www.twilio.com](https://www.twilio.com/).
- Create a `Phone Number` project (under Products section)
- On the project dashboard, click on `Get a Number` and create a new Twilio Number
- A **trial Twilio account is enough**, you'll receive a call with a "demo" audio file.

### Set-up ###

This tools is monitoring `localhost`. It means **it must be deployed where the lisk node lives**.

1. Clone this repository: `git clone https://github.com/hirishh/lisk-redphone.git`
2. `cd lisk-redphone`
3. `npm install`
4. Set the required information on `config/default.json` (you find everything in your twilio account)
```json
{
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
  "isTestnet": false
}
```
5. Run `npm start` or `DEBUG=lisk-redphone* npm start` if you want to see debug logs.

 
### Run with PM2 ###

Prerequisites: you are done with the first 4 steps of Set-up process.

Starting
```
pm2 start app.json --watch
```

Checking logs
```
pm2 logs lisk-redphone
```

Stopping
```
pm2 stop lisk-redphone
```

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

Copy-paste the last command. Now, *if you didn't before*, run the application with ```pm2 start app.json --watch``` and then:
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