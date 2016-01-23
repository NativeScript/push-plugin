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

## Message API

You can set several properties on the notification through the message sent to the device. They might differ depending on platform.

```javascript
	
     {
        "to": "fF9-oHSVJnr5UKe1fdRcyEz ...",
        "data" : {
            "title" : "The notification title", 
            "message" : "Message content lorem ipsum ...",
            "largeIcon" : "logo", // Android: icon for the notification dropdown
            "smallIcon" : "ic_notification", // Android: The small notification in status field 
            "color" : "#FF4081"
        }
    }

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
