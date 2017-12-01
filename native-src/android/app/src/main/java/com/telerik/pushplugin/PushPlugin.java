package com.telerik.pushplugin;

import android.content.Context;
import android.util.Log;
import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

import org.json.JSONException;

import java.util.Map;

/**
 * Push plugin extends the GCM Listener Service and has to be registered in the AndroidManifest
 * in order to receive Notification Messages.
 */
public class PushPlugin extends FirebaseMessagingService {
    static final String TAG = "PushPlugin";

    static boolean isActive = false;
    private static JsonObjectExtended cachedData;
    private static PushPluginListener onMessageReceivedCallback;
    private static PushPluginListener onTokenRefreshCallback;

    /**
     * Register the application in GCM
     *
     * @param appContext
     * @param projectId
     * @param callbacks
     */
    public static void register(Context appContext, String projectId, PushPluginListener callbacks) {
        if (callbacks == null) {
            Log.d(TAG, "Registering without providing a callback!");
        }

        PushPlugin.getRegisterTokenInThread(projectId, callbacks);
    }

    /**
     * Unregister the application from GCM
     *
     * @param appContext
     * @param projectId
     * @param callbacks
     */
    public static void unregister(Context appContext, String projectId, PushPluginListener callbacks) {
        if (callbacks == null) {
            Log.d(TAG, "Unregister without providing a callback!");
        }
        try {
            UnregisterTokenThread t = new UnregisterTokenThread(projectId, callbacks);
            t.start();
        } catch (Exception ex) {
            callbacks.error("Thread failed to start: " + ex.getMessage());
        }
    }

    /**
     * Set the on message received callback
     *
     * @param callbacks
     */
    public static void setOnMessageReceivedCallback(PushPluginListener callbacks) {
        onMessageReceivedCallback = callbacks;
        RemoteMessage.Notification whatever = null;

        if (cachedData != null) {
            Log.d(TAG, "Cached data is not empty!");
            executeOnMessageReceivedCallback(cachedData, whatever);
            cachedData = null;
        }
    }

    /**
     * Execute the onMessageReceivedCallback with the data passed.
     * In case the callback is not present, cache the data;
     *
     * @param data
     * @param notif
     */
    public static void executeOnMessageReceivedCallback(Map<String, String> data, RemoteMessage.Notification notif) {
        JsonObjectExtended jsonData = convertMapToJson(data);
        executeOnMessageReceivedCallback(jsonData, notif);
    }

    private static JsonObjectExtended convertMapToJson(Map<String, String> data) {
        JsonObjectExtended json = new JsonObjectExtended();

        if (data != null) {
            try {
                for (String key: data.keySet()) {
                    json.put(key, JsonObjectExtended.wrap(data.get(key)));
                }
                json.put("foreground", PushPlugin.isActive);
            } catch (JSONException ex) {
                Log.d(TAG, "Error thrown while parsing push notification data bundle to json: " + ex.getMessage());
            }
        }

        return json;
    }

    private static void executeOnMessageReceivedCallback(JsonObjectExtended dataAsJson, RemoteMessage.Notification notif) {
        if (onMessageReceivedCallback != null) {
            Log.d(TAG, "Passing data and notification to callback...");
            onMessageReceivedCallback.success(dataAsJson.toString(), notif);
        } else {
            Log.d(TAG, "No callback function - caching the data for later retrieval.");
            cachedData = dataAsJson;
        }
    }

    /**
     * Handles the push messages receive event.
     */
    @Override
    public void onMessageReceived(RemoteMessage message) {
        Map<String, String> data = message.getData();
        RemoteMessage.Notification notif = message.getNotification();
        Log.d(TAG, "New Push Message: " + data);
        Log.d(TAG, "Msg notification: " + notif);

        if (notif != null) {
            Log.d(TAG, "Notification body: " + notif.getBody());
        }

        boolean isCallbackRegistered = onMessageReceivedCallback != null;
        Log.d(TAG, "Callback is registered: " + isCallbackRegistered);

        // If the application has the callback registered
        // execute the callback. Otherwise, let the OS handle the notification.
        if (isCallbackRegistered) {
            executeOnMessageReceivedCallback(data, notif);
        }
    }

    /**
     * Set the on token refresh callback
     *
     * @param callbacks
     */
    public static void setOnTokenRefreshCallback(PushPluginListener callbacks) {
        onTokenRefreshCallback = callbacks;
    }


    /**
     * Execute the onTokeRefreshCallback.
     */
    public static void executeOnTokenRefreshCallback() {
        if (onTokenRefreshCallback != null) {
            Log.d(TAG, "Executing token refresh callback.");
            onTokenRefreshCallback.success(null);
        } else {
            Log.d(TAG, "No token refresh callback");
        }
    }

    /**
     * This method always returns true. It is here only for legacy purposes.
     */
    public static Boolean areNotificationsEnabled() {
        return true;
    }

    private static void getRegisterTokenInThread(String projectId, PushPluginListener callbacks) {
        try {
            ObtainTokenThread t = new ObtainTokenThread(projectId, callbacks);
            t.start();
        } catch (Exception ex) {
            callbacks.error("Thread failed to start: " + ex.getMessage());
        }
    }
}
