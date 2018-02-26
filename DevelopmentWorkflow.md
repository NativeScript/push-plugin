# Development Workflow

<!-- TOC depthFrom:2 -->

- [Prerequisites](#prerequisites)
- [Develop locally](#develop-locally)

<!-- /TOC -->

## Prerequisites

- Install your native toolchain and NativeScript as [described in the docs](https://docs.nativescript.org/start/quick-setup)

- Review [NativeScript plugins documentation](https://docs.nativescript.org/plugins/plugins) for more details on plugins development

## Develop locally

For local development we recommend using the npm commands provided in the plugin's package.json

To run and develop using TypeScript demo:

```bash
# Go to demo directory
cd nativescript-camera/demo
# Build the plugin. This compiles all TypeScript files in the plugin directory, which is referenced in the demo's package.json
npm run build.plugin
# Install demo dependencies
npm i
# Run the demo for iOS or Android.
tns run ios
tns run android
```

After all the changes are done make sure to test them in all the demo app.

Available npm commands from the plugin source directory:

- `build` - builds the plugin so it can be used in the demo app.
- `tslint` - check plugin's TypeScript sources for linting errors.
- `clean` - clean the demo and plugin directories and build the plugin.

## Build the plugin

In order to build the native projects in the `native-src` directory, you need to have Xcode for the ios native project and Java or Android Studio for the Gradle build of the Android native project. Note that this is not required if you don't plan to update the native code - prebuilt binaries for iOS and Android are included in the `src/platforms` directory.

## Testing the plugin

Before building and running the demo for the first time, you should change the application ID (set by default to `org.nativescript.ppTest`) in the `demo/package.json` file to match your application in Firebase and/or provision in iOS. For Android, you should also update the `demo/app/App_Resources/Android/app.gradle` file with the new application ID.

- Android - make sure you have added your `google-services.json` file to the `demo/app/App_Resources/Android` directory and that you have updated the `demo/app/main-view-model.ts` file with the sender ID of from your Firebase configuration. After the demo app is started the console will show the registration token of the device. For example:

        w7ycrQS0sU:APA91bHCAxiFqonJb77cc785txYZ_0nrWe_sLRZm_nG32h4lhaJhZw-mquBh0rlmaoRVQBhnRsWiMTOWOcbCzuvGCOVKo7UAxog8JEufQO-nOJo3C2cMpPsT9RfiZVgaDc2tK9ezRUf9

    To test push notifications for the device, you can use the following web request:

    curl -X POST --header "Authorization: key=<YOUR_SERVER_KEY_HERE>" --Header "Content-Type: application/json" https://fcm.googleapis.com/fcm/send -d "{\"notification\":{\"title\": \"My title\", \"text\": \"My text\", \"badge\": \"1\", \"sound\": \"default\"}, \"data\":{\"foo\":\"bar\"}, \"priority\": \"High\", \"to\": \"<YOUR_DEVICE_TOKEN_HERE>\"}"

    where <YOUR_SERVER_KEY_HERE> is the Server key from the Firebase Cloud Messaging Settings page and <YOUR_DEVICE_TOKEN_HERE> is the token you copied from the console.

- iOS - make sure that you are using the correct provisioning profile and app ID with enabled APNs. After the application is started the console will show the registration token for the device. For example:

        7058206f33224ff472976d5a80a1c913b4133c5815cca829d2e4d92a82e1c3b6

    To test push notifications for the device, you can use a third party app like [Pusher](https://github.com/noodlewerk/NWPusher). Open the app, load the correct push certificate and use the device ID from the console to send a message.

For details on plugins development workflow, read [NativeScript plugins documentation](https://docs.nativescript.org/plugins/building-plugins#step-2-set-up-a-development-workflow) covering that topic.