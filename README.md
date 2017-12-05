# Push Plugin for NativeScript

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

- Go to the application folder and add the Android platform to the application

		tns platform add android

- Add the `google-settings.json` file with the FCM configuration to the `app/App_Resources/Android folder` in your app

The plugin will default to version 11.4.2 of the `firebase-messaging` SDK.  If you need to change the version, you can add a project ext property `firebaseMessagingVersion` like so:

```Groovy
	// in the root level of /app/App_Resources/Android/app.gradle:
	project.ext {
	    firebaseMessagingVersion = "+" // OR the version you wish
	}
```

### iOS

- Edit the package.json file in the root of application, by changing the bundle identifier to match the one from your Push Certificate. For example:
    ```
        "id": "org.NativeScript.PushNotificationApp"
    ```

- Go to the application folder and add the iOS platform to the application

        tns platform add ios


## Usage 
### Android

Add code in your view model or compoent to subscribe and receive messages (don't forget to enter your Firebase Cloud Messaging **Sender ID** in the options of the register method):

*TypeScript*
```TypeScript
	import * as pushPlugin from "nativescript-push-notifications";
    pushPlugin.register({ senderID: '<ENTER_YOUR_PROJECT_NUMBER>' }, (token: String) => {
		alert("Device registered. Access token: " + token);;
	}, function() { });

	pushPlugin.onMessageReceived((stringifiedData: String, fcmNotification: any) => {
        const notificationBody = fcmNotification && fcmNotification.getBody();
        alert("Message received!\n" + notificationBody + "\n" + stringifiedData);
    });
```

*Javascript*
```Javascript
	var pushPlugin = require("nativescript-push-notifications");
	pushPlugin.register({ senderID: '<ENTER_YOUR_PROJECT_NUMBER>' }, function (data){
		alert("message", "" + data);
	}, function() { });

	pushPlugin.onMessageReceived(function callback(stringifiedData, fcmNotification) {
		var notificationBody = fcmNotification && fcmNotification.getBody();
        alert("Message received!\n" + notificationBody + "\n" + stringifiedData);
	});
```

- Run the app on the phone or emulator:

		tns run android

- The access token is written in the console and displayed on the device after the plugin sucessfully subscribes to receive notifications. When notification comes, the message will be displayed in the notification area if the app is closed or on screen if the app is open.

### iOS

Add code in your view model or compoent to subscribe and receive messages:

*TypeScript*
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

*Javascript*
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

	    tns run ios

## API Reference 

#### register(options, successCallback, errorCallback) - subscribe the device with Apple/Google push notifications services so the app can receive notifications. Options can contain:

| Option | Platform | Type | Description |
| --- |  --- | --- | --- |
| senderID | Android | String | The Sender ID for the FCM project. This option is required for Android. |
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

*Javascript*
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
			// if we're on android device we have the onMessageReceived function to subscribe
			// for push notifications
			if(pushPlugin.onMessageReceived) {
				pushPlugin.onMessageReceived(settings.notificationCallbackAndroid);
			}

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

#### unregister(successCallback, errorCallback, options) - unsubscribe the device so the app stops receiving push notifications. The options object is the same as on the `register` method.

| Parameter | Platform | Type | Description |
| --- |  --- | --- | --- |
| successCallback | iOS | Function | Called when app is successfully unsubscribed. Has one object parameter with the result. |
| successCallback | Android | Function | Called when app is successfully unsubscribed. Has one string parameter with the result. |
| errorCallback | Android | Function | Called when app is NOT successfully unsubscribed. Has one parameter containing the error. |
| options | Android | Function | Called when app is NOT successfully unsubscribed. Has one parameter containing the error. |

*Javascript*
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

*Javascript*
```Javascript
	pushPlugin.areNotificationsEnabled(function(areEnabled) {
		alert('Are Notifications enabled: ' + areEnabled);
    });
```

### Android only:

#### onMessageReceived(callback) - register a callback function to execute when receiving a notification. Callback function has the followint parameters:

| Parameter | Type | Description |
| --- |  --- | --- |
| message | String | The notification message (if available). |
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

#### onTokenRefresh(callback) - register a callback function to execute when the old token is revoked and a new token is obtained. 

| Parameter | Type | Description |
| --- |  --- | --- |
| callback | Function | Called with a single string parameter containing the FCM new token. |

*Javascript*
```Javascript

	pushPlugin.onTokenRefresh(function(token) {
			alert(token);
	});

```

### iOS only:

#### registerUserNotificationSettings(successCallback, errorCallback) - used to register for interactive push on iOS.

| Parameter | Type | Description |
| --- |  --- | --- |
| successCallback | Function | Called when app is successfully unsubscribed. Has one object parameter with the result. |
| errorCallback | Function | Called when app is NOT successfully unsubscribed. Has one parameter containing the error. |

## Troubleshooting

In case the application doesn't work as expected. Here are some things you can verify

### Android

- Ensure that the AndroindManifest.xml located at platforms\android contains the following snippets for registering the GCM listener:

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

- Ensure that the AndroindManifest.xml located at platforms\android contains the following permissions for push notifications:

```xml
	<uses-permission android:name="android.permission.GET_ACCOUNTS" />
	<uses-permission android:name="android.permission.WAKE_LOCK" />
	<uses-permission android:name="com.google.android.c2dm.permission.RECEIVE" />
```

### iOS

- Error "Error registering: no valid 'aps-environment' entitlement string found for application" - this means that the certificates are not correctly set in the xcodeproject. Open the xcodeproject, fix them and you can even run the application from xcode to verify it's setup correctly. The bundle identifier in xcode should be the same as the "id" in the package.json file in the root of the project.

## Android Configuration for using Firebase Cloud Messaging

The `nativescript-push-notifications` module for Android relies on the Firebase Cloud Messaging (FCM) SDK. In the steps below you will be guided to complete a few additional steps to prepare your Android app to receive push notifications from FCM.

1. Add the FCM SDK

> Thе `google-services` plugin is added automatically. If this fails, you can try adding it manually:

- Navigate to the project `platforms/android/` folder and locate the application-level `build.gradle` file
- Add the `google-services` plugin to the list of other dependencies in your app's `build.gradle` file
	```Groovy
	dependencies {
		// ...
		classpath "com.google.gms:google-services:3.0.0"
		// ...
	}
	```
- Add the following line be at the bottom of your `build.gradle` file to enable the Gradle plugin
	```Groovy
	apply plugin: 'com.google.gms.google-services'
	```

2. Add the `google-services.json` file

	To use FCM, you need this file. It contains configurations and credentials for your Firebase project. To obtain this follow the instructions for adding Firebase to your project from the official [documentation](https://firebase.google.com/docs/android/setup). Scroll down to the **Manually add Firebase** section.  

	Place the file in your app's `App_Resources/Android` folder

3. Obtain the FCM Server Key

	This key is required to be able to send programmatically push notifications to your app. You can obtain this key from your Firebase project.

### Receive and Handle Messages from FCM on Android

The plugin allows for handling **data**, **notification**, and messages that contain **both** payload keys which  for the purposes of this article are reffered to as **mixed**. More specifics on these messages are explained [here](https://firebase.google.com/docs/cloud-messaging/concept-options#notifications_and_data_messages).

The plugin extends the `FirebaseMessagingService` and overrides its `onMessageReceived` callback. In your app you need to use the `onMessageReceived(stringifiedData, fcmNotification)` method of the NativeScript module.

The behavior of the `onMessageReceived` callback in the module follows the behavior of the FCM service.

#### Handling **Data** Messages

The `onMessageReceived` method of the plugin is called each time a `data` notification is received.

When in background mode, a notification is constructed according to the values of the key specified above and placed in the tray. Tapping the notification launches the app and invokes the `onMessageReceived` callback.

#### Handling **Notification** Messages

If the app is in foreground, it invokes the `onMessageReceived` callback with three arguments (stringifiedData, fcmNotification).

If the app is in background, a notification is put in the tray. When tapped, it launches the app, but does not invoke the `onMessageReceived` callback.

#### Handling **Mixed** Messages

Mixed messages are messages that contain in their load both **data** and **notification** keys. When such message is received:

- The app is in foreground, the `onMessageReceived` callback is invoked with parameters (stringifiedData, fcmNotification)
- The app is in background, the `onMessageReceived` callback is not invoked. A notification is placed in the system tray. If the notification in the tray is tapped, the `data` part of the mixed message is available in the extras of the intent of the activity and are available in the respective [application event](https://docs.nativescript.org/core-concepts/application-lifecycle) of NativeScript.  

Example of handling the `data` part in the application *resume* event (e.g. the app was brought to the foreground from the notification):

*Javascript*
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

#### Parameters of the onMessageReceived Callback

Depending on the notification event and payload, the `onMessageReceived` callback is invoked with up to three arguments.

* `message` - *String*. A string representation of the `data.message` value in the notification payload.
* `stringifiedData` - *String*. A stringified JSON representation of the `data` value in the notification payload.
* `fcmNotification` - `RemoteMessage.Notification`. A representation of the `RemoteMessage.Notification` class which can be accessed according to its public methods. This parameter is available in case the callback was called from a message with a `notification` key in the payload.

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
