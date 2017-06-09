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
        actions: IosInteractiveNotificationAction[],
        categories: IosInteractiveNotificationCategory[]
    },
    notificationCallbackIOS: (message: string) => void;
}

export declare interface NSError {
    code: number;
    domain: string;
    userInfo: any
}

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

// Common
export declare function register(options: IosRegistrationOptions, successCallback: (token: string) => void, errorCallback: (error: NSError) => void): void;
export declare function register(options: { senderID: string }, successCallback: (fcmRegistrationToken: string) => void, errorCallback: (errorMessage: string) => void): void;
export declare function unregister(successCallback: (successMessage: string) => void): void; // iOS
export declare function unregister(successCallback: (successMessage: string) => void, errorCallback: (errorMessage: string) => void, options: { senderID: string }): void;
export declare function areNotificationsEnabled(callback: (boolean) => void): void;

// Android only
export declare function onMessageReceived(callback: (stringifiedData: string, fcmNotification: FcmNotificaion) => void): void;
export declare function onTokenRefresh(callback: () => void): void;

// iOS only
export declare function registerUserNotificationSettings(successCallback: () => void, errorCallback: (error: NSError) => void): void;
