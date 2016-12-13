package com.telerik.pushplugin;

/**
 * Defines methods for Success and Error callbacks
 */
public interface PushPluginListener {
    /**
     * Defines a success callback method, which is used to pass success function reference
     * from the nativescript to the Java plugin
     *
     * @param message
     * @param data
     */
    void success(Object message, Object data);
    void success(Object message); // method overload to mimic optional argument


    /**
     * Defines a error callback method, which is used to pass success function reference
     * from the nativescript to the Java plugin
     *
     * @param data
     */
    void error(Object data);
}
