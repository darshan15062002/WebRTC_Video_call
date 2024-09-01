const admin = require('firebase-admin');
const sendNotification = (deviceToken, data, data2) => {
    console.log("sending push notification");

    const message = {
        notification: {
            title: 'Incoming Call',
            body: `${data.callerName} is calling you`,

        },
        data: {
            callId: data.callId,
            callerName: data.callerName
        },
        token: deviceToken,
    };

    admin.messaging().send(message)
        .then(response => {
            console.log('Successfully sent message:', response);
        })
        .catch(error => {
            console.log('Error sending message:', error);
        });
};

module.exports = sendNotification