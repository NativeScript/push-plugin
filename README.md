# Push Plugin for NativeScript

The code for the Push Plugin for NativeScript.

- [Getting started](#getting-started)
- [API Reference](#api)
- [Troubleshooting](#troubleshooting)
- [Using with Telerik Backend Services](#using-with-telerik-backend-services)
- [Android Configuration for using Firebase Cloud Messaging](#android-configuration-for-using-firebase-cloud-messaging)



## Getting started

- Create a new NativeScript application

		tns create MyApp

	or use an existing one.

- Add the Push Plugin (from NPM). This will install the push plugin in the `node_modules` folder, in the root of the project. When adding a new platform (or using an existing one) the plugin will be added there as well. Go to the application folder and add the push plugin:

		tns plugin add nativescript-push-notifications

### Android

> See the [Android Configuration for using Firebase Cloud Messaging](#android-configuration-for-using-firebase-cloud-messaging) for information about how to add Firebase to your project.

- Go to the application folder and add the Android platform to the application

		tns platform add android

- Add sample code in app/main-view-model.js in the function HelloWorldModel() like this one to subscribe and receive messages (enter your Firebase Cloud Messaging **Sender ID** in the options of the register method):

```javascript
	var pushPlugin = require("nativescript-push-notifications");
	var self = this;
	pushPlugin.register({ senderID: '<ENTER_YOUR_PROJECT_NUMBER>' }, function (data){
		self.set("message", "" + JSON.stringify(data));
	}, function() { });

	pushPlugin.onMessageReceived(function callback(data) {
		self.set("message", "" + JSON.stringify(data));
	});
```

- Attach your phone to the PC, ensure "adb devices" command lists it and run the app on the phone:

		tns run android

- The access token is written in the console and in the message area, after subscribing (Look for ObtainTokenThread log record). When sending a notification, the message below the TAP button should be changed with the message received.

### iOS

- Edit the package.json file in the root of application, by changing the bundle identifier to match the one from your Push Certificate. For example:
        "id": "com.telerik.PushNotificationApp"

- Go to the application folder and add the iOS platform to the application

        tns platform add ios

- Add sample code in app/main-view-model.js in the function HelloWorldModel() like this one to subscribe and receive messages (Enter your google project id in the options of the register method):

```javascript
	var pushPlugin = require("nativescript-push-notifications");
        var self = this;
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
                self.set("message", "" + JSON.stringify(data));
            }
        };

        pushPlugin.register(iosSettings, function (data) {
            self.set("message", "" + JSON.stringify(data));

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

- Run the code

	tns run ios

- Send notifications

## API
```javascript
	// Get reference to the push plugin module.
	var pushPlugin = require('nativescript-push-notifications');
```

- ***register*** - use to subscribe device for push notifications

> register(settings, successCallback, errorCallback)

```javascript

	var settings = {
		// Android settings
		senderID: '<ENTER_YOUR_PROJECT_NUMBER>', // Android: Required setting with the sender/project number
		notificationCallbackAndroid: function(message, pushNotificationObject) { // Android: Callback to invoke when a new push is received.
        	alert(JSON.stringify(message));
        },

		// iOS settings
        badge: true, // Enable setting badge through Push Notification
        sound: true, // Enable playing a sound
        alert: true, // Enable creating a alert

        // Callback to invoke, when a push is received on iOS
        notificationCallbackIOS: function(message) {
        	alert(JSON.stringify(message));
        }
	};


	pushPlugin.register(settings,
		// Success callback
		function(token) {
                        // if we're on android device we have the onMessageReceived function to subscribe
			// for push notifications
			if(pushPlugin.onMessageReceived) {
				pushPlugin.onMessageReceived(settings.notificationCallbackAndroid);
			}

			alert('Device registered successfully');
		},
		// Error Callback
		function(error){
			alert(error.message);
		}
	);

```


- ***unregister*** - use to unsubscribe from Push Notifications

> unregister(successCallback, errorCallback, settings)

```javascript

	pushPlugin.unregister(
		// Success callback
		function(){
			alert('Device unregistered successfully');
		},
		// Error Callback
		function(error){
			alert(error.message);
		},

		// The settings from the registration phase
		settings
	);

```

- **Register for interactive push notifications (iOS >= 8.0)** - in order to handle interacitve notifications, you have to pass additional settings while registering your device. The message object in the **notificationCallbackIOS** will contain a property with the value of the identifier.

> register(settings, successCallback, errorCallback)

```javascript

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

- ***areNotificationsEnabled*** - check if the notifications for the device are enabled. Returns true/false. Applicable only for iOS, for Android always returns true.

> areNotificationsEnabled(callback)

```javascript

	pushPlugin.areNotificationsEnabled(function(areEnabled) {
		alert('Are Notifications enabled: ' + areEnabled);
    });

```

- ***onTokenRefresh*** - Android only, subscribe for the token refresh event (Used to obtain the new token in cases where google revoke the old one)

> onTokenRefresh(callback)

```javascript

	pushPlugin.onTokenRefresh(function(token){
			alert(token);
		});

```

## Troubleshooting

In case the application doesn't work as expected. Here are some things you can verify

### Android

- Ensure that the AndroidManifest.xml located at platforms\android\build\... (**do not add it in your "App_Resources\AndroidManifest.xml" file**, it's automatically done) contains the following snippets for registering the GCM listener:

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

- Ensure that the AndroidManifest.xml located at platforms\android\build\... contains the following permissions for push notifications:

```xml
	<uses-permission android:name="android.permission.GET_ACCOUNTS" />
	<uses-permission android:name="android.permission.WAKE_LOCK" />
	<uses-permission android:name="com.google.android.c2dm.permission.RECEIVE" />
```

### iOS

- Error "Error registering: no valid 'aps-environment' entitlement string found for application" - this means that the certificates are not correctly set in the xcodeproject. Open the xcodeproject, fix them and you can even run the application from xcode to verify it's setup correctly. The bundle identifier in xcode should be the same as the "id" in the package.json file in the root of the project.

## Using with Telerik Backend Services

In order to use the plugin with Telerik Backend Services take a look at the official sample:

[Telerik Backend Services NativeScript Push Sample](https://github.com/NativeScript/sample-push-plugin)

## Android Configuration for using Firebase Cloud Messaging

From version **0.1.0** the `nativescript-push-notifications` module for Android relies on the Firebase Cloud Messaging (FCM) SDK. In the steps below you will be guided to complete a few additional steps to prepare your Android app to receive push notifications from FCM.

1. Add the FCM SDK

> Since version 0.1.1 thе `google-services` plugin is added via a hook. You can skip this step for versions 0.1.1 and above.  


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

1. Add the `google-services.json` file

	To use FCM, you need this file. It contains configurations and credentials for your Firebase project. To obtain this follow the instructions for adding Firebase to your project from the official [documentation](https://firebase.google.com/docs/android/setup). Scroll down to the **Manually add Firebase** section.  

	Place the file in your app's `App_Resources/Android` folder

1. Obtain the FCM Server Key

	This key is required to be able to send programmatically push notifications to your app. You can obtain this key from your Firebase project.

	If you are using the Telerik Platform Notifications service refer to this [article](http://docs.telerik.com/platform/backend-services/javascript/push-notifications/push-enabling#android-settings) for instructions how to set up this key.  

### Receive and Handle Messages from FCM on Android

The plugin allows for handling **data**, **notification**, and messages that contain **both** payload keys which  for the purposes of this article are reffered to as **mixed**. More specifics on these messages are explained [here](https://firebase.google.com/docs/cloud-messaging/concept-options#notifications_and_data_messages).

The plugin extends the `FirebaseMessagingService` and overrides its `onMessageReceived` callback. In your app you need to use the `onMessageReceived(message, data, notification)` method of the NativeScript module.

The behavior of the `onMessageReceived` callback in the module follows the behavior of the FCM service.

#### Handling **Data** Messages

The `onMessageReceived` method of the plugin is called each time a `data` notification is received.

When in background mode, a notification is constructed according to the values of the key specified above and placed in the tray. Tapping the notification launches the app and invokes the `onMessageReceived` callback.

#### Handling **Notification** Messages

If the app is in foreground, it invokes the `onMessageReceived` callback with three arguments (message, data, notification).

If the app is in background, a notification is put in the tray. When tapped, it launches the app, but does not invoke the `onMessageReceived` callback.

#### Handling **Mixed** Messages

Mixed messages are messages that contain in their load both **data** and **notification** keys. When such message is received:

- The app is in foreground, the `onMessageReceived` callback is invoked with parameters (message, data)
- The app is in background, the `onMessageReceived` callback is not invoked. A notification is placed in the system tray. If the notification in the tray is tapped, the `data` part of the mixed message is available in the extras of the intent of the activity and are available in the respective [application event](https://docs.nativescript.org/core-concepts/application-lifecycle) of NativeScript.  

Example of handling the `data` part in the application *resume* event (e.g. the app was brought to the foreground from the notification):

```
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
* `data` - *Object*. A JSON representation of the `data` value in the notification payload.
* `notification` - `RemoteMessage.Notification`. A representation of the `RemoteMessage.Notification` class which can be accessed according to its public methods. This parameter is available in case the callback was called from a message with a `notification` key in the payload.

#### Setting Notification Icon and Color

> From version 0.1.0 the module no longer adds as default a large icon of the notification because this was forcing developers to always use a large icon which is not the native behavior.

The plugin automatically handles some keys in the `data` object like `message`, `title`, `color`, `smallIcon`, `largeIcon` and uses them to construct a notification entry in the tray. More information on these keys is available in the documentation of the Telerik Platform Notifications service documentation [article](http://docs.telerik.com/platform/backend-services/javascript/push-notifications/send-and-target/push-send-target-examples).

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
