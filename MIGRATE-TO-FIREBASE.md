This is a migration guide which can help you switch your app from using push-plugin to using nativescript-plugin-firebase
1. Go to your app's root folder and execute
```bash
tns plugin add nativescript-plugin-firebase
```
> Upon plugin installation, you'll be prompted to choose which features to use. Choose "yes" for Firebase Messaging (of course :)). By default, the plugin saves the configuration as a file (firebase.nativescript.json) to use it when reinstalling the plugin.

2. Add `GoogleService-Info.plist` (for iOS) or `google-services.json` (for Android) in App_Resources/iOS (and App_Resources/Android, respectively). These are the configuration files that come from your Firebase apps. If you don't have such yet, go to https://console.firebase.google.com and create one. See [firebase plugin's docs]("https://github.com/EddyVerbruggen/nativescript-plugin-firebase/blob/master/docs/MESSAGING.md") for more info on initial setup.

3. Add some code [to handle a notification]("https://github.com/EddyVerbruggen/nativescript-plugin-firebase/blob/master/docs/MESSAGING.md#handling-a-notification") 

EXAMPLE: The following code using push-plugin:
```js
private pushSettings = {
    notificationCallbackIOS: (message: any) => {
        this.updateMessage("Message received!\n" + JSON.stringify(message));
    }
};

pushPlugin.register(this.pushSettings, (token: String) => {
    console.log("Device registered. Access token: " + token);

    pushPlugin.registerUserNotificationSettings(() => {
        console.log("Successfully registered for push.");
    }, (err) => {
        console.log(("Error registering for interactive push: " + JSON.stringify(err));
    });
}, (errorMessage: String) => {
    console.log((JSON.stringify(errorMessage));
});
```
... could be rewriten using firebase like:
```js
firebase.init({
    onMessageReceivedCallback: (message: firebase.Message) => {
        console.log(`Message: ${message}`);
    },
    onPushTokenReceivedCallback: function(token) {
        console.log("Firebase push token: " + token);
    }
});
```
To test with sending messages, you can use the UI in Firebase Console, or use the  `https://fcm.googleapis.com/fcm/send` API. See the [testing docs section in firebase plugin]("https://github.com/EddyVerbruggen/nativescript-plugin-firebase/blob/master/docs/MESSAGING.md#testing").

4. 

-----------

2.  You can go to demos and see there but below are how some usages of push-plugin translate to firebase:
 
pushPlugin.areNotificationsEnabled(<some-callback-func>) -> firebase.areNotificationsEnabled(): boolean
| push-plugin | nativescript-plugin-firebase |
| :-------------: | :-------------: | 
| pushPlugin.areNotificationsEnabled(<some-callback-func>)      | firebase.areNotificationsEnabled(): boolean |
| 
pushPlugin.register(this.pushSettings)
pushPlugin.registerUserNotificationSettings()      | firebase.registerForInteractivePush(model) |