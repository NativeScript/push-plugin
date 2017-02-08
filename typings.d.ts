declare module 'nativescript-push-notifications' {

  export function register({senderID:string}, callback: Function, errorCallback: Function);

  export function onTokenRefresh(callback: Function);

  export function onMessageReceived(callback: Function);

}
