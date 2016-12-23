# Push Plugin for NativeScript

The code for the Push Plugin for NativeScript.

- [Getting started](#getting-started)
- [API Reference](#api)
- [Troubleshooting](#troubleshooting)
- [Using with Telerik Backend Services](#using-with-telerik-backend-services)


## Getting started

- Create a new NativeScript application

		tns create MyApp

	or use an existing one.

- Add the Push Plugin (from NPM). This will install the push plugin in node_module, in the root of the project. When adding a new platform (or using an existing one) the plugin will be added there as well. Go to the application folder and add the push plugin:

		tns plugin add nativescript-push-notifications 

### Android

- Go to the application folder and add the Android platform to the application

		tns platform add android

- Add sample code in app/main-view-model.js in the function HelloWorldModel() like this one to subscribe and receive messages (Enter your google project number in the options of the register method):

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

- Ensure that the AndroindManifest.xml located at platforms\android contains the following snippets for registering the GCM listener:

```xml
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

## Using with Telerik Backend Services

In order to use the plugin with Telerik Backend Services take a look at the official sample:

[Telerik Backend Services NativeScript Push Sample](https://github.com/NativeScript/sample-push-plugin)


## FCM migration changes testing cheatsheet

0. Run "tns doctor" and make sure everything is up to date

1. Install the plugin
	- go into package.json at the root of the project (most probably push sample) and set the dir to "absolute/path/to/pushpluginrepo"

2. Amend build.gradle to include the google-services gradle plugin and apply it
	- open projectRoot/platforms/android/build.gradle
	- find the following piece of code (it's at the top)

	```groovy
		buildscript {
			repositories {
				jcenter()
			}

			dependencies {
				classpath "com.android.tools.build:gradle:2.1.2"
				classpath "com.google.gms:google-services:3.0.0" // <<==   This line will not be there. Add it.
			}
		}
	```

	- add | classpath "com.google.gms:google-services:3.0.0" | as a dependency (as shown above)
	- add | apply plugin: "com.google.gms.google-services" | at the very bottom of the file

3. google-services.json
	To use FCM, you need this file. It contains configurations and credentials for your Google/Firebase project. To get one...

	- visit http://firebase.google.com.
	- create a Firebase project or migrate an existing Google project
	- in the project "overview" page click "Add Firebase to your Android app" in the top middle of the page.
	- type in package name (for the push sample project "com.telerik.PushNotificationApp")
	- leave the other fields empty (it's just a test app) and click "Add app" - this will download your google-services.json
	- place the google-services.json file into projectroot/App_Resources/Android

	If something goes wrong, try this - https://firebase.google.com/docs/android/setup

4. The Firebase Server key
	You need a Server key to send messages.

	- go to the project you created/migrated in 3) "overview" page
	- in the top left of the page (under the Firebase logo), click the gear icon and select "project settings"
	- from the tabs at the top of the newly opened page, click "cloud messaging"
	- copy the "Server key" into the "Push Settings" page of Backend Services as "Google API Key"
	- copy the Sender ID and use it to register with the push plugin (for the push sample app, paste it where it asks for google project number)

5. tns run android

	- test the push plugin


### Things that have changed

- When you send a notification through Backend Services, the value of the "Android" key can now have both "data" and "notification" keys.
- Notification messages are Data, Notification or Mixed
- The "data" key should function just like before:
	- its "message", "title", "color", "smallIcon", "largeIcon" (etc..) keys should be respected
	- the onMessageReceived callback is called each time a "data" notification is received with the same arguments
	- when in background mode, a notification is created in the tray (otherwise, it is not). tapping that notification launches the app and invokes the onMessageReceived callback with the same arguments
- The "notification" key is new. It functions like the native FCM implementation... more or less :)
	- notification messages support all FCM key/values
	- if the app is in foreground, it invokes the onMessageReceived callback with arguments (message, dataAsJson) - this may change, according to what you and Dobrev figure out, ask him
	- if the app is in background, a notification is put in the tray. When tapped, it launches the app, but does not invoke the onMessageReceived callback
- mixed messages are supported. when a mixed message is received and....
	- the app is in foreground, the onMessageReceived callback is invoked with params (message, dataAsJson)
	- the app is in background, the onMessageReceived callback is not invoked
	- the app is in background, and the notification in the tray is tapped, the "data" part of the mixed message is available in the extras of the intent of the launched activity - these can be accessed with through nativescript, like they would in Java
- we have removed the default large icon because it forced you to have a large icon and this wasnt the behaviour of FCM notifications
- default color and icon for FCM messages can be set in the AndroidManifest.xml of the project using this XML, inside the <application> tag:

```xml
	<meta-data
		android:name="com.google.firebase.messaging.default_notification_icon"
		android:resource="@drawable/ic_stat_ic_notification" />
	<meta-data
		android:name="com.google.firebase.messaging.default_notification_color"
		android:resource="@color/colorAccent" />
```

For more info: https://firebase.google.com/docs/cloud-messaging/android/topic-messaging#edit-the-app-manifest
