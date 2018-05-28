/*
In NativeScript, the app.ts file is the entry point to your application.
You can use this file to perform app-level initialization, but the primary
purpose of the file is to pass control to the app’s first module.
*/

import * as app from 'tns-core-modules/application';

// ANDROID ONLY!
// this event is used to handle notifications that have been received while the app is not in the foreground
// in iOS the system invokes the notificationCallbackIOS method automatically when a notification is tapped
app.on(app.resumeEvent, function(args) {
    if (args.android) {
        const act = args.android;
        const intent = act.getIntent();
        const extras = intent.getExtras();
        if (extras) {
            console.log("If your notification has data (key: value) pairs, they will be listed here:");
            const keys = extras.keySet();
            const iterator = keys.iterator();
            while (iterator.hasNext()) {
                const key = iterator.next();
                console.log(key + ": " + extras.get(key).toString());
            }
        }
    }
});

app.start({ moduleName: 'main-page' });

/*
Do not place any code after the application has been started as it will not
be executed on iOS.
*/
