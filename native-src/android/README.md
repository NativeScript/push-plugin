# Push Plugin for Android

This is the native java code for push notifications for the Android platform, which is designed to be easily used in NativeScript.

# Build

The project contains an intellij project file. It must be configured to use the Android SDK by specifying the local location of the SDK.

The build's output is in the /out folder, containing the .aar file ready to be used in an Android Application.

# API

- Register - use to subscribe the device for Push Notifications

> public static void register(Context appContext, String projectId, PushPluginListener callbacks)


- Unregister - use to unsubscribe from Push Notifications

> public static void unregister (Context appContext, String projectId, PushPluginListener callbacks)
 
- OnMessageReceived - subscribe to be called via a listener

> public static void setOnMessageReceivedCallback(PushPluginListener callbacks)

- OnTokenRefresh - subscribe for the token refresh event

> public static void executeOnTokenRefreshCallback()

- Are notifications enabled - currently this cannot be checked in meaningful way and will always return true

> public static Boolean areNotificationsEnabled () 