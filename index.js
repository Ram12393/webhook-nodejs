const crypto = require('crypto');

const express = require('express');
const app = express();
const moment = require('moment');
const pushNotification = require('./pushnotification');

const API_SECRET = 'secret';

app.use(express.json({
  verify: (req, res, buffer) => {
    req.rawBody = buffer;
  }
}));

app.post('/', async (req, res) => {
  // console.log();
  const signature = _generateSignature(req.method, req.url, req.headers['x-cs-timestamp'], req.rawBody);
  // console.log('------------->',signature);
  // if ( signature !== req.headers[ 'x-cs-signature' ] ) {
  //     return res.sendStatus( 401 );
  // }
  let tempObj = req.body;
  if (tempObj.event.type === 'entry') {
    let time = moment.utc(tempObj.event.recorded_at).format('HH:mma');
    time = convertToGMTtoLocal(time);
    let notificationObj = {
      title: 'Entry',
      Description: `user entry at ${time}`
    }
    let result = await pushNotification.sendPushNotification(notificationObj);
  }
  res.sendStatus(200);
});

convertToGMTtoLocal = (time) => {
  const dateTime = time; // GMT
  const hour = dateTime.split(':')[0];
  const minute = dateTime.split(':')[1];

  const date = new Date(); // UTC
  let localHour = hour - date.getTimezoneOffset() / 60;
  let localMinute = (localHour % 1) * 60;

  localHour = Math.floor(localHour);
  localMinute += parseInt(minute);
  if (localMinute >= 60) {
    localHour += Math.floor(localMinute / 60);
    localMinute %= 60;
  }

  localHour %= 12;
  const addAMPM = localHour %= 12;
  const hasSecondNumber = `${localMinute}`.length;
  return `${localHour}:${localMinute}${hasSecondNumber === 1 ? '0' : ''} ${addAMPM <= 12 ? 'PM' : 'AM'}`;
}
app.get('/', (req, res) => {
  console.log('received webhook', req.body);
  res.send(`${new Date().getMilliseconds()}`);
});


app.post('/send-push-notification', async (req, res) => {
  try {
    let result = await pushNotification.sendPushNotification();
    res.send(result);
  } catch (error) {
    console.log(error);
    throw error
  }

});

app.listen(9000, () => console.log('Node.js server started on port 9000.'));

function _generateSignature(method, url, timestamp, body) {
  const hmac = crypto.createHmac('SHA256', API_SECRET);

  hmac.update(`${ method.toUpperCase() }${ url }${ timestamp }`);

  if (body) {
    hmac.update(body);
  }

  return hmac.digest('hex');
}
