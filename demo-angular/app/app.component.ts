import { Component, ChangeDetectorRef, OnInit } from "@angular/core";
import { ListView } from "tns-core-modules/ui/list-view";
import { isAndroid } from "tns-core-modules/platform";
import * as pushPlugin from "nativescript-push-notifications";

@Component({
    selector: "my-app",
    templateUrl: "app.component.html",
})
export class AppComponent implements OnInit {

    private pushSettings = {
        // Android settings
        senderID: "<ENTER_YOUR_PROJECT_NUMBER>", // Android: Required setting with the sender/project number
        notificationCallbackAndroid: (message: String, stringifiedData: String, fcmNotification: any) => {
            const notificationBody = fcmNotification && fcmNotification.getBody();
            this.updateMessage("Message received!\n" + notificationBody + "\n" + stringifiedData);
        },

        // iOS settings
        badge: true, // Enable setting badge through Push Notification
        sound: true, // Enable playing a sound
        alert: true, // Enable creating a alert
        notificationCallbackIOS: (message: String) => {
            this.updateMessage("Message received!\n" + message);
        }
    };

    private _message: string;

    constructor(private _changeDetectionRef: ChangeDetectorRef) {

    }

    ngOnInit(): void {
        this.message = "";
        this.updateMessage("App started.");

        let self = this;
        // this.onRegisterButtonTap();
    }

    get message(): string {
        return this._message;
    }

    set message(value: string) {
        if (this._message !== value) {
            this._message = value;
            this._changeDetectionRef.detectChanges();
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
        self.updateMessage("Registering...");
        pushPlugin.register(this.pushSettings, (token: String) => {
            self.updateMessage("Device registered. Access token: " + token);

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
        self.updateMessage("Unregistering...");
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
