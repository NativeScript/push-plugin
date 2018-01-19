import { Observable } from "tns-core-modules/data/observable";
import * as pushPlugin from "nativescript-push-notifications";
import * as app from 'tns-core-modules/application';

export class PushTestModel extends Observable {

    private pushSettings = {
        // Android settings
        senderID: "<ENTER_YOUR_PROJECT_NUMBER>", // Android: Required setting with the sender/project number
        notificationCallbackAndroid: (stringifiedData: String, fcmNotification: any) => {
            const notificationBody = fcmNotification && fcmNotification.getBody();
            this.updateMessage("Message received!\n" + notificationBody + "\n" + stringifiedData);
        },

        // iOS settings
        badge: true, // Enable setting badge through Push Notification
        sound: true, // Enable playing a sound
        alert: true, // Enable creating a alert
        notificationCallbackIOS: (message: any) => {
            this.updateMessage("Message received!\n" + JSON.stringify(message));
        }
    };

    private _counter: number;
    private _message: string;

    constructor() {
        super();
        this.message = "";
        this.updateMessage("App started.");

        let self = this;
        this.onRegisterButtonTap();

        // ANDROID ONLY!
        // this event is used to handle notifications that have been received while the app is not in the foreground
        // in iOS the system invokes the notificationCallbackIOS method automatically when a notification is tapped
        app.on(app.resumeEvent, function(args) {
            if (args.android) {
                const act = args.android;
                const intent = act.getIntent();
                const extras = intent.getExtras();
                self.updateMessage("Resuming activity");
                if (extras) {
                    self.updateMessage("If your notification has data (key: value) pairs, they will be listed here:");
                    const keys = extras.keySet();
                    const iterator = keys.iterator();
                    while (iterator.hasNext()) {
                        const key = iterator.next();
                        self.updateMessage(key + ": " + extras.get(key).toString());
                        // clear the used keys in order to avoid getting them back
                        // when switching the application between background and foreground
                        intent.removeExtra(key);
                    }
                }
            }
        });
    }

    get message(): string {
        return this._message;
    }

    set message(value: string) {
        if (this._message !== value) {
            this._message = value;
            this.notifyPropertyChange("message", value);
        }
    }

    onCheckButtonTap() {
        let self = this;
        pushPlugin.areNotificationsEnabled((areEnabled: Boolean) => {
            self.updateMessage("Are Notifications enabled: " + !!areEnabled);
        });
    }

    onRegisterButtonTap() {
        let self = this;
        pushPlugin.register(this.pushSettings, (token: String) => {
            self.updateMessage("Device registered. Access token: " + token);
            // token displayed in console for easier copying and debugging durng development
            console.log("Device registered. Access token: " + token);

            if (pushPlugin.onMessageReceived) {
                pushPlugin.onMessageReceived(this.pushSettings.notificationCallbackAndroid);
            }

            if (pushPlugin.registerUserNotificationSettings) {
                pushPlugin.registerUserNotificationSettings(() => {
                    self.updateMessage("Successfully registered for interactive push.");
                }, (err) => {
                    self.updateMessage("Error registering for interactive push: " + JSON.stringify(err));
                });
            }
        }, (errorMessage: String) => {
            self.updateMessage(JSON.stringify(errorMessage));
        });
    }

    onUnregisterButtonTap() {
        let self = this;
        pushPlugin.unregister(
            (successMessage: String) => {
                self.updateMessage(successMessage);
            },
            (errorMessage: String) => {
                self.updateMessage(JSON.stringify(errorMessage));
            },
            this.pushSettings
        );
    }

    private updateMessage(text: String) {
        this.message += text + "\n";
    }

}