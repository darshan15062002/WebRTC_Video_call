const admin = require('firebase-admin');
const sendNotification = (deviceToken, data,) => {
    console.log("sending push notification");



    const message = {
        data: {
            type: 'call',
            callId: data.callId,
            callerName: data.callerName,
            callerAvatar: data.callerAvatar || '',  // Optional - if you want to show an avatar
            isVideo: data.isVideo || 'false'       // Optional - for video call indication
        },
        android: {
            priority: 'high',  // Ensure high priority to wake the device
            ttl: 0,            // Time to live - Immediate delivery
        },
        apns: {
            headers: {
                'apns-priority': '10'  // High priority for iOS
            },
            payload: {
                aps: {
                    contentAvailable: true,  // Required for background data delivery on iOS
                },
            },
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