import * as app from 'tns-core-modules/application';
declare var com: any;

export declare interface FcmNotificaion {
    getBody(): string;
    getBodyLocalizationArgs(): string[];
    getBodyLocalizationKey(): string;
    getClickAction(): string;
    getColor(): string;
    getIcon(): string;
    getSound(): string;
    getTag(): string;
    getTitle(): string;
    getTitleLocalizationArgs(): string[];
    getTitleLocalizationKey(): string;
}

(() => {
    let registerLifecycleEvents = () => {
        com.telerik.pushplugin.PushLifecycleCallbacks.registerCallbacks(app.android.nativeApp);
    };

    // Hook on the application events
    if (app.android.nativeApp) {
        registerLifecycleEvents();
    } else {
        app.on(app.launchEvent, registerLifecycleEvents);
    }
})();

export function register(options: { senderID: string, notificationCallbackAndroid?: () => any }, successCallback: (fcmRegistrationToken: string) => void, errorCallback: (errorMessage: string) => void) {
    com.telerik.pushplugin.PushPlugin.register(app.android.context, options.senderID,
        new com.telerik.pushplugin.PushPluginListener(
            {
                success: (fcmRegistrationToken: string) => {
                    if  (options && typeof options.notificationCallbackAndroid === 'function') {
                        onMessageReceived(options.notificationCallbackAndroid);
                    }

                    successCallback(fcmRegistrationToken);
                },
                error: errorCallback
            })
    );
}

export function unregister(onSuccessCallback: (successMessage: string) => void, onErrorCallback: (errorMessage: string) => void, options: { senderID: string }) {
    com.telerik.pushplugin.PushPlugin.unregister(app.android.context, options.senderID, new com.telerik.pushplugin.PushPluginListener(
        {
            success: onSuccessCallback,
            error: onErrorCallback
        }
    ));
}

export function onMessageReceived(onSuccessCallback: (message: string, stringifiedData: string, fcmNotification: FcmNotificaion) => void) {
    com.telerik.pushplugin.PushPlugin.setOnMessageReceivedCallback(
        new com.telerik.pushplugin.PushPluginListener(
            {
                success: onSuccessCallback
            })
    );
}

export function onTokenRefresh(onSuccessCallback: () => void) {
    com.telerik.pushplugin.PushPlugin.setOnTokenRefreshCallback(
        new com.telerik.pushplugin.PushPluginListener(
            {
                success: onSuccessCallback
            })
    );
}

export function areNotificationsEnabled(onSuccessCallback: (areEnabled: boolean) => void) {
    const bool = com.telerik.pushplugin.PushPlugin.areNotificationsEnabled();
    onSuccessCallback(bool);
}
