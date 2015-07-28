package com.telerik.pushplugin;

import android.content.Context;
import android.util.Log;
import com.google.android.gms.gcm.GoogleCloudMessaging;
import com.google.android.gms.iid.InstanceID;

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
    private final Context appContext;

    public ObtainTokenThread(String projectID, Context appContext, PushPluginListener callbacks) {
        this.projectId = projectID;
        this.appContext = appContext;
        this.callbacks = callbacks;
    }

    @Override
    public void run() {
        try {
            token = getTokenFromGCM();
        } catch (IOException e) {
            callbacks.error("Error while retrieving a token: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private String getTokenFromGCM() throws IOException {
        InstanceID instanceID = InstanceID.getInstance(this.appContext);
        this.token = instanceID.getToken(this.projectId,
                GoogleCloudMessaging.INSTANCE_ID_SCOPE, null);

        Log.d(TAG, this.token.toString());

        if(callbacks != null) {
            Log.d(TAG, "Calling listener callback with token: " + token);
            callbacks.success(token);
        } else {
            Log.d(TAG, "Token call returned, but no callback provided.");
        }

        // TODO: Wrap the whole callback.
        PushPlugin.isActive = true;
        return this.token;
    }


}