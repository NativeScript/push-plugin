if ((<any>global).TNS_WEBPACK) {
    // registers tns-core-modules UI framework modules
    require("bundle-entry-points");

    // register application modules
    global.registerModule("main-page", () => require("./main-page"));

    global.registerModule("nativescript-push-notifications", () => require("nativescript-push-notifications"));
}
