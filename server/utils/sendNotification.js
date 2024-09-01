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
                clickAction: 'FLUTTER_NOTIFICATION_CLICK', // Handle notification click in app
                channelId: 'high_importance_channel', // Make sure you have created a channel with this ID in your app
                priority: 'high',
                ongoing: true, // Makes the notification sticky, not removable until user action
                actions: [
                    {
                        title: "Accept",
                        action: "ACCEPT_CALL", // Custom action
                    },
                    {
                        title: "Reject",
                        action: "REJECT_CALL", // Custom action
                    }
                ]
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
