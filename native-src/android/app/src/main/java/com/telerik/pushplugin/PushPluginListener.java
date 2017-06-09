package com.telerik.pushplugin;

import com.google.firebase.messaging.RemoteMessage;

/**
 * Defines methods for Success and Error callbacks
 */
public interface PushPluginListener {
    /**
     * Defines a success callback method, which is used to pass success function reference
     * from the nativescript to the Java plugin
     *
     * @param data
     * @param notification
     */
    void success(Object data, RemoteMessage.Notification notification);
    void success(Object data);
    // method overload to mimic optional argument

    /**
     * Defines a error callback method, which is used to pass success function reference
     * from the nativescript to the Java plugin
     *
     * @param data
     */
    void error(Object data);
}
