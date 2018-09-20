# Migration guide push-plugin -> Firebase plugin
If you have an app that uses push-plugin for push notifications and need to switch to nativescript-plugin-firebase, this guide can help you. If you are just starting with push notifications, however, it would be best to use [Firebase plugin](https://github.com/EddyVerbruggen/nativescript-plugin-firebase) and refer [its documentation on messaging](https://github.com/EddyVerbruggen/nativescript-plugin-firebase/blob/master/docs/NON_FIREBASE_MESSAGING.md).

> In case you're stuck, check out [the 'push' demo app](https://github.com/EddyVerbruggen/nativescript-plugin-firebase/tree/master/demo-push) in the Firebase plugin repo.

#### 1. Add the plugin to your app
Go to your app's root folder in terminal app and execute
```bash
tns plugin add nativescript-plugin-firebase
```
> Upon plugin installation, you'll be prompted to choose which features to use. Choose "yes" for "Are you using this plugin ONLY as a Push Notification client for an external (non-Firebase) Push service?". By default, the plugin saves the configuration as a file (firebase.nativescript.json) to use it when reinstalling the plugin.

#### 2. Setup
Add `GoogleService-Info.plist` (for iOS) or `google-services.json` (for Android) in App_Resources/iOS (and App_Resources/Android, respectively). These are the configuration files that come from your Firebase apps. If you don't have such yet, go to https://console.firebase.google.com and create one. See [Firebase plugin's docs](https://github.com/EddyVerbruggen/nativescript-plugin-firebase/blob/master/docs/MESSAGING.md) for more info on initial setup.

#### 3. Initialization prerequisite
Make sure you [`require` the plugin in `app.ts` / `main.ts` / `main.aot.ts`](https://github.com/EddyVerbruggen/nativescript-plugin-firebase/blob/55cfb4f69cf8939f9101712fed22383196b08d36/demo/app/app.ts#L5)
*before* `application.start()`, and do `init()` *after* the app has started (not in `app.ts` - not even in a timeout; move it out of `app.ts` entirely!). This ensures the notifications will be receivable in the background.

EXAMPLE:
```js
// in app.ts
// ...
require("nativescript-plugin-firebase");
// ...
app.start({ moduleName: 'main-page' });
```

#### 4. Add some code [to register for push notifications](https://github.com/EddyVerbruggen/nativescript-plugin-firebase/blob/master/docs/NON_FIREBASE_MESSAGING.md#registerforpushnotifications) 

EXAMPLE: The following code using push-plugin:

```typescript
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

... could be rewriten using the Firebase plugin like:

```typescript
import { messaging } from "nativescript-plugin-firebase/messaging";

messaging.registerForPushNotifications({
  onPushTokenReceivedCallback: (token: string): void => {
    console.log("Firebase plugin received a push token: " + token);
  },

  onMessageReceivedCallback: (message: Message) => {
    console.log("Push message received: " + message.title);
  }
}).then(() => console.log("Registered for push"));
```

#### 5. Testing push notifications 
To test with real messages, you can use the UI in Firebase Console, use the `https://fcm.googleapis.com/fcm/send` API, or a third-party app like Pusher. See the [testing docs section in the Firebase plugin](https://github.com/EddyVerbruggen/nativescript-plugin-firebase/blob/master/docs/NON_FIREBASE_MESSAGING.md#testing-push-notifications).

#### 6. Interactive Push Notifications - in push plugin they are set in the options argument passed to pushPlugin.register(options, callback) method. In the Firebase plugin, it is done in a very similar way: 

```typescript
import { messaging } from "nativescript-plugin-firebase/messaging";
...
const model = new messaging.PushNotificationModel();
model.iosSettings = new messaging.IosPushSettings();
model.iosSettings.interactiveSettings = new messaging.IosInteractivePushSettings();
model.iosSettings.interactiveSettings.actions = [<<array of IosInteractiveNotificationAction>>]

model.iosSettings.interactiveSettings.categories = [{ identifier: "SOME CATEGORY" }];

model.onNotificationActionTakenCallback = () => {
    // callback to hook to if you want to handle what action have been taken by the user
};

messaging.registerForInteractivePush(model: messaging.PushNotificationModel);
```

Some lines in the above example have been omitted. See [Firebase plugin's interactive notifications docs](https://github.com/EddyVerbruggen/nativescript-plugin-firebase/blob/958b4639c557b3aee80c044fe917acffdbea27a7/docs/NON_FIREBASE_MESSAGING.md#interactive-notifications-ios-only-for-now) for more details.

#### 7. areNotificationsEnabled() API
In the Firebase plugin it is pretty similar to the one in push-plugin, and even simpler to use:

```typescript
import { messaging } from "nativescript-plugin-firebase/messaging";

const areTheyEnabled = messaging.areNotificationsEnabled(); // synchronous, retruns boolean;
```

This API is also supported in Android, SDK version 24 and above
