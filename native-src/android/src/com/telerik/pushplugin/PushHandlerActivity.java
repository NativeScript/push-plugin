package com.telerik.pushplugin;

import android.app.Activity;
import android.app.NotificationManager;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.util.Log;

/**
 * Activity which is an entry point, whenever a notification from the bar is tapped and executed.
 * The activity fires, notifies the callback.
 */
public class PushHandlerActivity extends Activity {
    private static String TAG = "PushPlugin.PushHandlerActivity";

    /*
     * this activity will be started if the user touches a notification that we own.
     * We send it's data off to the push plugin for processing.
     * If needed, we boot up the main activity to kickstart the application.
     * @see android.app.Activity#onCreate(android.os.Bundle)
     */
    @Override
    public void onCreate(Bundle savedInstanceState) {
        Log.d(TAG, "Creating...");

        super.onCreate(savedInstanceState);
        Log.v(TAG, "onCreate");

        boolean isPushPluginActive = PushPlugin.isActive;
        processPushBundle(isPushPluginActive);

        // remove this activity from the top of the stack
        finish();

        Log.d(TAG, "isPushPluginActive = " + isPushPluginActive);
        if (!isPushPluginActive) {
            forceMainActivityReload();
        }
    }

    /**
     * Takes the pushBundle extras from the intent,
     * and sends it through to the PushPlugin for processing.
     */
    private void processPushBundle(boolean isPushPluginActive) {
        Bundle extras = getIntent().getExtras();
        Log.d(TAG, "Processing push extras: IsPushPluginActive = " + isPushPluginActive);

        if (extras != null) {
            Log.d(TAG, "Has extras.");
            Bundle originalExtras = extras.getBundle("pushBundle");

            originalExtras.putBoolean("foreground", false);
            originalExtras.putBoolean("coldstart", !isPushPluginActive);

            PushPlugin.executeOnMessageReceivedCallback(originalExtras);
        }
    }

    /**
     * Forces the main activity to re-launch if it's unloaded.
     */
    private void forceMainActivityReload() {
        PackageManager pm = getPackageManager();
        Intent launchIntent = pm.getLaunchIntentForPackage(getApplicationContext().getPackageName());
        Log.d(TAG, "starting activity for package: " + getApplicationContext().getPackageName());
        launchIntent.setPackage(null);
        startActivity(launchIntent);
    }

    @Override
    protected void onResume() {
        Log.d(TAG, "On resume");
        super.onResume();
        final NotificationManager notificationManager = (NotificationManager) this.getSystemService(Context.NOTIFICATION_SERVICE);
        notificationManager.cancelAll();
    }

}