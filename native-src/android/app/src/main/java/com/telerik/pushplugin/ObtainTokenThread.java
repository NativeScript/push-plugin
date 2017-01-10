package com.telerik.pushplugin;

import android.util.Log;
import com.google.firebase.iid.FirebaseInstanceId;

import java.io.IOException;

/**
 * Responsible for obtaining a Token from the GCM service.
 * By design, this must happen in async way in a Thread.
 */
public class ObtainTokenThread extends Thread {
    private static final String TAG = "ObtainTokenThread";
    private final PushPluginListener callbacks;

    private String token;
    private final String projectId;

    public ObtainTokenThread(String projectId, PushPluginListener callbacks) {
        this.projectId = projectId;
        this.callbacks = callbacks;
    }

    @Override
    public void run() {
        try {
            this.token = getTokenFromGCM();
        } catch (IOException e) {
            this.callbacks.error("Error while retrieving a token: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private String getTokenFromGCM() throws IOException {
        this.token = FirebaseInstanceId.getInstance().getToken(this.projectId, "FCM");

        if(this.callbacks != null) {
            Log.d(TAG, "Calling listener callback with token: " + this.token);
            this.callbacks.success(this.token);
        } else {
            Log.d(TAG, "Token call returned, but no callback provided.");
        }

        // TODO: Wrap the whole callback.
        PushPlugin.isActive = true;
        return this.token;
    }
}
