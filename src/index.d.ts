// Android only
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
export declare function register(options: {
    senderID: string;
    notificationCallbackAndroid?: () => any;
}, successCallback: (fcmRegistrationToken: string) => void, errorCallback: (errorMessage: string) => void): void;
export declare function unregister(onSuccessCallback: (successMessage: string) => void, onErrorCallback: (errorMessage: string) => void, options: {
    senderID: string;
}): void;
export declare function onMessageReceived(onSuccessCallback: (message: string, stringifiedData: string, fcmNotification: FcmNotificaion) => void): void;
export declare function onTokenRefresh(onSuccessCallback: () => void): void;

// iOS only
export declare interface IosInteractiveNotificationAction {
    identifier: string;
    title: string;
    activationMode?: string;
    destructive?: boolean;
    authenticationRequired?: boolean;
    behavior?: string;
}
export declare interface IosInteractiveNotificationCategory {
    identifier: string;
    actionsForDefaultContext: string[];
    actionsForMinimalContext: string[];
}
export declare interface IosRegistrationOptions {
    badge: boolean;
    sound: boolean;
    alert: boolean;
    clearBadge: boolean;
    interactiveSettings: {
        actions: IosInteractiveNotificationAction[];
        categories: IosInteractiveNotificationCategory[];
    };
    notificationCallbackIOS: (message: any) => void;
}
export declare interface NSError {
    code: number;
    domain: string;
    userInfo: any;
}
export declare function register(settings: IosRegistrationOptions, success: (token: String) => void, error: (error: NSError) => void): void;
export declare function registerUserNotificationSettings(success: () => void, error: (error: NSError) => void): void;
export declare function unregister(done: (context: any) => void): void;

// Common
export declare function areNotificationsEnabled(done: (areEnabled: Boolean) => void): void;

