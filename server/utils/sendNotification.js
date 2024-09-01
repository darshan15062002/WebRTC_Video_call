const admin = require('firebase-admin');
const sendNotification = (deviceToken, data) => {
    console.log("Sending push notification");

    const message = {
        notification: {
            title: 'Incoming Call',
            body: `${data.callerName} is calling you`,
        },
        android: {
            notification: {
                clickAction: 'FLUTTER_NOTIFICATION_CLICK',
                channelId: 'high_importance_channel',
                priority: 'high',

            },
            data: {
                type: 'call',
                callId: data.callId,
                callerName: data.callerName,
                deeplink: `yourapp://call/join?callId=${data.callId}&code=${data.code}` // Deep link to join call
            }
        },
        apns: {
            headers: {
                'apns-priority': '10' // High priority for iOS
            },
            payload: {
                aps: {
                    category: 'CALL_INCOMING', // Needs to be defined in your iOS app
                    sound: 'default',
                    alert: {
                        title: 'Incoming Call',
                        body: `${data.callerName} is calling you`
                    }
                },
                data: {
                    callId: data.callId,
                    callerName: data.callerName,
                    deeplink: `yourapp://call/join?callId=${data.callId}&code=${data.code}`
                }
            }
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

module.exports = sendNotification;
