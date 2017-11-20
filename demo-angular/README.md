This NativeScript project demonstrates how the plugin works.
If you want to test it out on an emulator or a device you can follow the instructions below:

* `git clone https://github.com/NativeScript/NativeScript/push-plugin.git`
* `cd push-plugin/demo` or `cd push-plugin/demo-angular`
* if you are building for android, copy the `google-services.json` downloaded from the general settings page for your project in the Firebase console and add the Sender ID from the Cloud Messaging settings page to the `app/main-view-model.ts` file.
* `npm run build.plugin && npm install`
* `tns run android` or `tns run ios` depending on the platform you want to test

