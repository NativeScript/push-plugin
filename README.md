# Push Plugin for NativeScript

[![Build Status](https://travis-ci.org/NativeScript/push-plugin.svg?branch=master)](https://travis-ci.org/NativeScript/push-plugin)

The code for the Push Plugin for NativeScript.

- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Troubleshooting](#troubleshooting)
- [Android Configuration for using Firebase Cloud Messaging](#android-configuration-for-using-firebase-cloud-messaging)

## Installation

In the Command prompt / Terminal navigate to your application root folder and run:

    tns plugin add nativescript-push-notifications

## Configuration

### Android

> See the [Android Configuration for using Firebase Cloud Messaging](#android-configuration-for-using-firebase-cloud-messaging) for information about how to add Firebase to your project.

- Edit the `package.json` file in the root of application, by changing the bundle identifier to match the Firebase's project package name. For example:
    ```json
    "id": "org.nativescript.PushNotificationApp"
    ```

- Edit the `app/App_Resources/Android/app.gradle` file of your application, by changing the application ID to match the bundle identifier from the package.json. For example:
    ```Groovy
    android {
    // ...
        defaultConfig {
            applicationId = "org.nativescript.PushNotificationApp"
        }
    // ...
    }
    ```

- Go to the application folder and add the Android platform to the application
    ```bash
    tns platform add android
    ```

- Add the `google-settings.json` file with the FCM configuration to the `app/App_Resources/Android folder` in your app. If this file is not added, building the app for android will fail.

The plugin will default to version 11.8.0 of the `firebase-messaging` SDK.  If you need to change the version, you can add a project ext property `firebaseMessagingVersion`:

```Groovy
    // in the root level of /app/App_Resources/Android/app.gradle:
    project.ext {
        firebaseMessagingVersion = "+" // OR the version you wish
    }
```

### iOS

- Ensure you have set up an App in your Apple Developer account, with Push Notifications enabled and configured. More on this in the Apple's [AddingCapabilities documentation](https://developer.apple.com/library/content/documentation/IDEs/Conceptual/AppDistributionGuide/AddingCapabilities/AddingCapabilities.html) > `Configuring Push Notifications` section.

- Edit the package.json file in the root of application, by changing the bundle identifier to match the App ID. For example:
    ```json
    "id": "org.nativescript.PushNotificationApp"
    ```

- Go to the application folder and add the iOS platform to the application
    ```bash
    tns build ios
    ```

- Go to (application folder)/platforms/ios and open the XCode project. Enable Push Notifications in the project Capabilities options. In case you don't have XCode, go to (application folder)/platforms/ios/(application folder name) , find *.entitlements file and add to it `aps-environment` key and its value as shown below:
    ```xml
    <plist version="1.0">
    <dict>
        <key>aps-environment</key>
        <string>development</string>
    </dict>
    </plist>
    ```

## Usage

### Using the plugin in Android

Add code in your view model or component to subscribe and receive messages (don't forget to enter your Firebase Cloud Messaging **Sender ID** in the options of the register method):

#### TypeScript

```TypeScript
import * as pushPlugin from "nativescript-push-notifications";
private pushSettings = {
    senderID: "<ENTER_YOUR_PROJECT_NUMBER>", // Required: setting with the sender/project number
    notificationCallbackAndroid: (stringifiedData: String, fcmNotification: any) => {
        const notificationBody = fcmNotification && fcmNotification.getBody();
        this.updateMessage("Message received!\n" + notificationBody + "\n" + stringifiedData);
    }
};
pushPlugin.register(pushSettings, (token: String) => {
    alert("Device registered. Access token: " + token);;
}, function() { });
```

#### Javascript

```Javascript
var pushPlugin = require("nativescript-push-notifications");
var pushSettings = {
        senderID: "<ENTER_YOUR_PROJECT_NUMBER>", // Required: setting with the sender/project number
        notificationCallbackAndroid: function (stringifiedData, fcmNotification) {
            var notificationBody = fcmNotification && fcmNotification.getBody();
            _this.updateMessage("Message received!\n" + notificationBody + "\n" + stringifiedData);
        }
    };
pushPlugin.register(pushSettings, function (token) {
    alert("Device registered. Access token: " + token);
}, function() { });
```

- Run the app on the phone or emulator:
    ```bash
    tns run android
    ```

- The access token is written in the console and displayed on the device after the plugin sucessfully subscribes to receive notifications. When a notification comes, the message will be displayed in the notification area if the app is closed or handled directly in the notificationCallbackAndroid callback if the app is open.

### Using the plugin in iOS

Add code in your view model or component to subscribe and receive messages:

#### TypeScript

```TypeScript
import * as pushPlugin from "nativescript-push-notifications";
const iosSettings = {
    badge: true,
    sound: true,
    alert: true,
    interactiveSettings: {
        actions: [{
            identifier: 'READ_IDENTIFIER',
            title: 'Read',
            activationMode: "foreground",
            destructive: false,
            authenticationRequired: true
        }, {
            identifier: 'CANCEL_IDENTIFIER',
            title: 'Cancel',
            activationMode: "foreground",
            destructive: true,
            authenticationRequired: true
        }],
        categories: [{
            identifier: 'READ_CATEGORY',
            actionsForDefaultContext: ['READ_IDENTIFIER', 'CANCEL_IDENTIFIER'],
            actionsForMinimalContext: ['READ_IDENTIFIER', 'CANCEL_IDENTIFIER']
        }]
    },
    notificationCallbackIOS: (message: any) => {
        alert("Message received!\n" + JSON.stringify(message));
    }
};

pushPlugin.register(iosSettings, (token: String) => {
    alert("Device registered. Access token: " + token);

    // Register the interactive settings
    if(iosSettings.interactiveSettings) {
        pushPlugin.registerUserNotificationSettings(() => {
            alert('Successfully registered for interactive push.');
        }, (err) => {
            alert('Error registering for interactive push: ' + JSON.stringify(err));
        });
    }
}, (errorMessage: any) => {
    alert("Device NOT registered! " + JSON.stringify(errorMessage));
});
```

#### Javascript

```Javascript
var pushPlugin = require("nativescript-push-notifications");
var iosSettings = {
    badge: true,
    sound: true,
    alert: true,
    interactiveSettings: {
        actions: [{
            identifier: 'READ_IDENTIFIER',
            title: 'Read',
            activationMode: "foreground",
            destructive: false,
            authenticationRequired: true
        }, {
            identifier: 'CANCEL_IDENTIFIER',
            title: 'Cancel',
            activationMode: "foreground",
            destructive: true,
            authenticationRequired: true
        }],
        categories: [{
            identifier: 'READ_CATEGORY',
            actionsForDefaultContext: ['READ_IDENTIFIER', 'CANCEL_IDENTIFIER'],
            actionsForMinimalContext: ['READ_IDENTIFIER', 'CANCEL_IDENTIFIER']
        }]
    },
    notificationCallbackIOS: function (data) {
        alert("message", "" + JSON.stringify(data));
    }
};

pushPlugin.register(iosSettings, function (data) {
    alert("Device registered. Access token" + data);

    // Register the interactive settings
        if(iosSettings.interactiveSettings) {
            pushPlugin.registerUserNotificationSettings(function() {
                alert('Successfully registered for interactive push.');
            }, function(err) {
                alert('Error registering for interactive push: ' + JSON.stringify(err));
            });
        }
}, function() { });
```

- Run the app on the phone or simulator:
    ```bash
    tns run ios
    ```

- [HINT] Install the [pusher app](https://github.com/noodlewerk/NWPusher) to send notifications to the device being debugged on. In the 'device push token' field paste the device access token generated in the {N} CLI / XCode debug console after launching the app.

## API Reference

### Methods

#### register(options, successCallback, errorCallback) - subscribe the device with Apple/Google push notifications services so the app can receive notifications

| Option | Platform | Type | Description |
| --- |  --- | --- | --- |
| senderID | Android | String | The Sender ID for the FCM project. This option is required for Android. |
| notificationCallbackAndroid | Android | Function | Callback to invoke, when a push is received on Android. |
| badge | iOS | Boolean | Enable setting the badge through Push Notification. |
| sound | iOS | Boolean | Enable playing a sound. |
| alert | iOS | Boolean | Enable creating a alert. |
| clearBadge | iOS | Boolean | Enable clearing the badge on push registration. |
| notificationCallbackIOS | iOS | Function | Callback to invoke, when a push is received on iOS. |
| interactiveSettings | iOS | Object | Interactive settings for use when registerUserNotificationSettings is used on iOS. |

The interactiveSettings object for iOS can contain the following:

| Option | Type | Description |
| --- |  --- | --- |
| actions | Array | A list of iOS interactive notification actions. |
| categories | Array | A list of iOS interactive notification categories. |

The `actions` array from the iOS interactive settings contains:

| Option | Type | Description |
| --- |  --- | --- |
| identifier | String | Required. String identifier of the action. |
| title | String | Required. Title of the button action. |
| activationMode | String | Set to either "foreground" or "background" to launch the app in foreground/background and respond to the action. |
| destructive | Boolean | Enable if the action is destructive. Will change the action color to red instead of the default. |
| authenticationRequired | Boolean | Enable if the device must be unlocked to perform the action. |
| behavior | String | Set if the action has a different behavior - e.g. text input. |

The `categories` array from the iOS interactive settings contains:

| Option | Type | Description |
| --- |  --- | --- |
| identifier | String | Required. String identifier of the category. |
| actionsForDefaultContext | Array | Required. Array of string identifiers of actions. |
| actionsForMinimalContext | Array | Required. Array of string identifiers of actions. |

For more information about iOS interactive notifications, please visit the [Apple Developer site](https://developer.apple.com/notifications/)

```Javascript
var settings = {
    badge: true,
    sound: true,
    alert: true,
    interactiveSettings: {
        actions: [{
            identifier: 'READ_IDENTIFIER',
            title: 'Read',
            activationMode: "foreground",
            destructive: false,
            authenticationRequired: true
        }, {
        identifier: 'CANCEL_IDENTIFIER',
            title: 'Cancel',
            activationMode: "foreground",
            destructive: true,
            authenticationRequired: true
        }],
        categories: [{
            identifier: 'READ_CATEGORY',
            actionsForDefaultContext: ['READ_IDENTIFIER', 'CANCEL_IDENTIFIER'],
            actionsForMinimalContext: ['READ_IDENTIFIER', 'CANCEL_IDENTIFIER']
        }]
    },
    notificationCallbackIOS: function(message) {
        alert(JSON.stringify(message));
    }
};


pushPlugin.register(settings,
    // Success callback
    function(token){
        // Register the interactive settings
        if(settings.interactiveSettings) {
            pushPlugin.registerUserNotificationSettings(function() {
                alert('Successfully registered for interactive push.');
            }, function(err) {
                alert('Error registering for interactive push: ' + JSON.stringify(err));
            });
        }
    },
    // Error Callback
    function(error){
        alert(error.message);
    }
);
```

#### unregister(successCallback, errorCallback, options) - unsubscribe the device so the app stops receiving push notifications. The options object is the same as on the `register` method

| Parameter | Platform | Type | Description |
| --- |  --- | --- | --- |
| successCallback | iOS | Function | Called when app is successfully unsubscribed. Has one object parameter with the result. |
| successCallback | Android | Function | Called when app is successfully unsubscribed. Has one string parameter with the result. |
| errorCallback | Android | Function | Called when app is NOT successfully unsubscribed. Has one parameter containing the error. |
| options | Android | Function | Called when app is NOT successfully unsubscribed. Has one parameter containing the error. |

```Javascript
pushPlugin.unregister(
    // Success callback
    function(result) {
        alert('Device unregistered successfully');
    },
    // Error Callback
    function(errorMessage) {
        alert(errorMessage);
    },
    // The settings from the registration phase
    settings
);
```

#### areNotificationsEnabled(successCallback) - check if push notifications are enabled (iOS only, always returns true on Android)

| Parameter | Platform | Type | Description |
| --- |  --- | --- | --- |
| successCallback | iOS/Android | Function | Called with one boolean parameter containing the result from the notifications enabled check. |

```Javascript
pushPlugin.areNotificationsEnabled(function(areEnabled) {
        alert('Are Notifications enabled: ' + areEnabled);
    });
```

### Android only methods

#### onMessageReceived(callback) ***DEPRECATED*** - register a callback function to execute when receiving a notification. You should set this from the `notificationCallbackAndroid` registration option instead

| Parameter | Type | Description |
| --- |  --- | --- |
| stringifiedData | String | A string containing JSON data from the notification |
| fcmNotification | Object | iOS/Android | Function | The FCMNotification object. |

The fcmNotification object contains the following methods:

| Method | Returns |
| --- |  --- |
| getBody() | String |
| getBodyLocalizationArgs() | String[] |
| getBodyLocalizationKey() | String |
| getClickAction() | String |
| getColor() | String |
| getIcon() | String |
| getSound() | String |
| getTag() | String |
| getTitle() | String |
| getTitleLocalizationArgs() | String[] |
| getTitleLocalizationKey() | String |

#### onTokenRefresh(callback) - register a callback function to execute when the old token is revoked and a new token is obtained. Note that the token is _not_ passed to the callback as an argument. If you need the new token value, you'll need to call `register` again or add some native code to obtain the token from FCM

| Parameter | Type | Description |
| --- |  --- | --- |
| callback | Function | Called with no arguments. |

```Javascript
pushPlugin.onTokenRefresh(function() {
        alert("new token obtained");
});
```

### iOS only

#### registerUserNotificationSettings(successCallback, errorCallback) - used to register for interactive push on iOS

| Parameter | Type | Description |
| --- |  --- | --- |
| successCallback | Function | Called when app is successfully unsubscribed. Has one object parameter with the result. |
| errorCallback | Function | Called when app is NOT successfully unsubscribed. Has one parameter containing the error. |

## Troubleshooting

In case the application doesn't work as expected. Here are some things you can verify

### Troubleshooting issues in Android

- When the application is started using `tns run android` (i.e. in debug mode with livesync) some background notifications might not be received correctly. This happens because the app is not started in a normal way for debugging and the resume from background happens differently. To receive all notifications correctly, stop the app (swipe it away it from the recent apps list) and start it again by tapping the app icon on the device.

- Thе `google-services` plugin is added automatically. If this fails, you can try adding it manually:
- - Navigate to the project `platforms/android/` folder and locate the application-level `build.gradle` file
- - Add the `google-services` plugin to the list of other dependencies in your app's `build.gradle` file
	```Groovy
	dependencies {
		// ...
		classpath "com.google.gms:google-services:3.0.0"
		// ...
	}
	```
- - Add the following line be at the bottom of your `build.gradle` file to enable the Gradle plugin
	```Groovy
	apply plugin: 'com.google.gms.google-services'
	```

- Ensure that the AndroidManifest.xml located at platforms/android/build/... (**do not add it in your "App_Resources/Android/AndroidManifest.xml" file**) contains the following snippets for registering the GCM listener:
    ```XML
    <activity android:name="com.telerik.pushplugin.PushHandlerActivity"/>
    <receiver
        android:name="com.google.android.gms.gcm.GcmReceiver"
        android:exported="true"
        android:permission="com.google.android.c2dm.permission.SEND" >
        <intent-filter>
            <action android:name="com.google.android.c2dm.intent.RECEIVE" />
            <category android:name="com.pushApp.gcm" />
        </intent-filter>
    </receiver>
    <service
        android:name="com.telerik.pushplugin.PushPlugin"
        android:exported="false" >
        <intent-filter>
            <action android:name="com.google.android.c2dm.intent.RECEIVE" />
        </intent-filter>
    </service>
    ```

- Ensure that the AndroidManifest.xml located at platforms/android/build/... contains the following permissions for push notifications:
    ```xml
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="com.google.android.c2dm.permission.RECEIVE" />
    ```

### Troubleshooting issues in iOS

- Error "Error registering: no valid 'aps-environment' entitlement string found for application" - this means that the certificates are not correctly set in the xcodeproject. Open the xcodeproject, fix them and you can even run the application from xcode to verify it's setup correctly. The bundle identifier in xcode should be the same as the "id" in the package.json file in the root of the project. Also make sure that "Push Notifications" is switched ON in the "Capabilities" page of the project settings.

## Android Configuration for using Firebase Cloud Messaging

The `nativescript-push-notifications` module for Android relies on the Firebase Cloud Messaging (FCM) SDK. In the steps below you will be guided to complete a few additional steps to prepare your Android app to receive push notifications from FCM.

1. Add the `google-services.json` file

    To use FCM, you need this file. It contains configurations and credentials for your Firebase project. To obtain this follow the instructions for adding Firebase to your project from the official [documentation](https://firebase.google.com/docs/android/setup). Scroll down to the **Manually add Firebase** section.

    Place the file in your app's `App_Resources/Android` folder

2. Obtain the FCM Server Key (optional)

    This key is required to be able to send programmatically push notifications to your app. You can obtain this key from your Firebase project.

### Receive and Handle Messages from FCM on Android

The plugin allows for handling **data**, **notification**, and messages that contain **both** payload keys which  for the purposes of this article are reffered to as **mixed**. More specifics on these messages are explained [here](https://firebase.google.com/docs/cloud-messaging/concept-options#notifications_and_data_messages).

The plugin extends the `FirebaseMessagingService` and overrides its `onMessageReceived` callback. In your app you need to use the `notificationCallbackAndroid` setting when calling the `register` method of the plugin.

The behavior of the callback in the module follows the behavior of the FCM service.

#### Handling **Data** Messages

The `notificationCallbackAndroid` method of the plugin is called each time a `data` notification is received.

If the app is stopped or suspended, NO notification is constructed and placed in the tray. Tapping the app icon launches the app and invokes the `notificationCallbackAndroid` callback where you will receive the notification data.

If the app is active and in foreground, the `notificationCallbackAndroid` callback is invoked immediately with the notification data (fcmNotification).

#### Handling **Notification** Messages

If the app is active and in foreground, it invokes the `notificationCallbackAndroid` callback with two arguments (stringifiedData, fcmNotification).

If the app is in background, a notification is put in the tray. When tapped, it launches the app, but does not invoke the `notificationCallbackAndroid` callback.

#### Handling **Mixed** Messages

Mixed messages are messages that contain in their load both **data** and **notification** keys. When such message is received:

- The app is in foreground, the `notificationCallbackAndroid` callback is invoked with parameters (stringifiedData, fcmNotification)
- The app is in background, the `notificationCallbackAndroid` callback is not invoked. A notification is placed in the system tray. If the notification in the tray is tapped, the `data` part of the mixed message is available in the extras of the intent of the activity and are available in the respective [application event](https://docs.nativescript.org/core-concepts/application-lifecycle) of NativeScript.

Example of handling the `data` part in the application *resume* event (e.g. the app was brought to the foreground from the notification):

```Javascript
application.on(application.resumeEvent, function(args) {
    if (args.android) {
        var act = args.android;
        var intent = act.getIntent();
        var extras = intent.getExtras();
        if (extras) {
            // for (var key in extras) {
            //     console.log(key + ' -> ' + extras[key]);
            // }
            var msg = extras.get('someKey');
        }
    }
});
```

#### Parameters of the notificationCallbackAndroid Callback

Depending on the notification event and payload, the `notificationCallbackAndroid` callback is invoked with two arguments.

- `stringifiedData` - *String*. A stringified JSON representation of the `data` value in the notification payload.
- `fcmNotification` - `RemoteMessage.Notification`. A representation of the `RemoteMessage.Notification` class which can be accessed according to its public methods. This parameter is available in case the callback was called from a message with a `notification` key in the payload.

#### Setting Notification Icon and Color

The plugin automatically handles some keys in the `data` object like `message`, `title`, `color`, `smallIcon`, `largeIcon` and uses them to construct a notification entry in the tray.

Custom default color and icon for **notification** messages can be set in the `AndroidManifest.xml` inside the `application` directive:
```XML
<meta-data
    android:name="com.google.firebase.messaging.default_notification_icon"
    android:resource="@drawable/ic_stat_ic_notification" />
<meta-data
    android:name="com.google.firebase.messaging.default_notification_color"
    android:resource="@color/colorAccent" />
```
> For more info visit the [Edit the app manifest](https://firebase.google.com/docs/cloud-messaging/android/topic-messaging#edit-the-app-manifest) article.
