const firebase = require('firebase-admin');
const serviceAccount = require('./pushnotification-e0e55-firebase-adminsdk-n9pm5-0d4252d12a.json');


firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: 'https://pushnotification-e0e55.firebaseio.com'
});

sendPushNotification = async (notification) => {
  let userToken =
    'fKNtofeNqP0:APA91bFp91js8Zf292eyX4M5a0sfdh6LMJ7xG077rZS6W6ONKz5EXANvW9we5cLk6MPOMR1h5HoCsDaUX1U44mEaATnmNy8RT44-VuaX0JvRq1Cvr56V0k2sl1-xF87lArDdca0VkavP';
  const firebaseToken = userToken;
  const payload = {
    notification: notification
  };
  const options = {
    priority: 'high',
    timeToLive: 60 * 60 * 24 // 1 day
  };


  let response = await firebase
    .messaging()
    .sendToDevice(firebaseToken, payload, options)
  return response;
};

module.exports = {
  sendPushNotification
}
