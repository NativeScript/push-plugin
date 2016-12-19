package com.telerik.pushplugin;

import android.util.Log;
import com.google.firebase.iid.FirebaseInstanceId;

import java.io.IOException;

/**
 * Responsible for unregister device from GCM service functionality.
 * By design, this must happen in async way in a Thread.
 */
public class UnregisterTokenThread extends Thread {
    private static final String TAG = "UnregisterTokenThread";

    private final String projectId;
    private final PushPluginListener callbacks;

    public UnregisterTokenThread(String projectId, PushPluginListener callbacks) {
        this.projectId = projectId;
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
        try {
            FirebaseInstanceId.getInstance().deleteToken(this.projectId, "FCM");
        } catch (IOException e) {
            if (callbacks != null) {
                callbacks.error("Invalid project ID.");
            }
            return;
        }

        Log.d(TAG, "Token deleted!");

        if(callbacks != null) {
            callbacks.success("Device unregistered!");
        }

        // TODO: Wrap the whole callback.
        PushPlugin.isActive = false;
    }
}
