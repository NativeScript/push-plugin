package com.telerik.pushplugin;

import android.content.Context;
import android.util.Log;
import com.google.android.gms.gcm.GoogleCloudMessaging;
import com.google.android.gms.iid.InstanceID;

import java.io.IOException;

/**
 * Responsible for unregister device from GCM service functionality.
 * By design, this must happen in async way in a Thread.
 */
public class UnregisterTokenThread extends Thread {
    private static final String TAG = "UnregisterTokenThread";

    private final String projectId;
    private final Context appContext;
    private final PushPluginListener callbacks;

    public UnregisterTokenThread(String projectID, Context appContext, PushPluginListener callbacks) {
        this.projectId = projectID;
        this.appContext = appContext;
        this.callbacks = callbacks;
    }

    @Override
    public void run() {
        try {
            deleteTokenFromGCM();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private void deleteTokenFromGCM() throws IOException {
        InstanceID instanceID = InstanceID.getInstance(this.appContext);
        instanceID.deleteToken(this.projectId,
                GoogleCloudMessaging.INSTANCE_ID_SCOPE);

        Log.d(TAG, "Token deleted!");

        if(callbacks != null) {
            callbacks.success("Device unregistered!");
        }

        // TODO: Wrap the whole callback.
        PushPlugin.isActive = false;
    }
}