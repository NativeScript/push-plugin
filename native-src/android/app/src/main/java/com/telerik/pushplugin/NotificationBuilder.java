package com.telerik.pushplugin;

import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.res.Resources;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Color;
import android.net.Uri;
import android.support.v4.app.NotificationCompat;
import android.util.Log;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

/**
 * Notification Builder is responsible for creating notifications from the application.
 * It uses the Notification Manager service to create and publish a new notification.
 */
public class NotificationBuilder {
    private static final String TAG = "NotificationBuilder";

    public static void createNotification(Context context, Map<String, String> msgData) {
        int notId = 0;

        try {
            notId = Integer.parseInt(msgData.get("notId"));
        } catch (NumberFormatException e) {
            Log.e(TAG, "Number format exception - Error parsing Notification ID: " + e.getMessage());
        } catch (Exception e) {
            Log.e(TAG, "Number format exception - Error parsing Notification ID" + e.getMessage());
        }
        if (notId == 0) {
            // no notId passed, so assume we want to show all notifications, so make it a random number
            notId = new Random().nextInt(100000);
            Log.d(TAG, "Generated random notId: " + notId);
        } else {
            Log.d(TAG, "Received notId: " + notId);
        }


        if (context == null) {
            Log.d(TAG, "Context is null!");
        }

        try {

            NotificationManager mNotificationManager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
            String appName = getAppName(context);

            Intent notificationIntent = new Intent(context, PushHandlerActivity.class);
            notificationIntent.addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            notificationIntent.putExtra("pushData", new HashMap<>(msgData));

            PendingIntent contentIntent = PendingIntent.getActivity(context, notId, notificationIntent, PendingIntent.FLAG_CANCEL_CURRENT);

            int defaults = Notification.DEFAULT_ALL;

            if (msgData.get("defaults") != null) {
                try {
                    defaults = Integer.parseInt(msgData.get("defaults"));
                } catch (NumberFormatException ignore) {
                }
            }

            NotificationCompat.Builder mBuilder =
                    new NotificationCompat.Builder(context)
                            .setDefaults(defaults)
                            .setSmallIcon(getSmallIcon(context, msgData))
                            .setWhen(System.currentTimeMillis())
                            .setContentTitle(msgData.get("title"))
                            .setTicker(msgData.get("title"))
                            .setContentIntent(contentIntent)
                            .setColor(getColor(msgData))
                            .setAutoCancel(true);

            String message = msgData.get("message");
            if (message != null) {
                mBuilder.setContentText(message);
            } else {
                mBuilder.setContentText("<missing message content>");
            }

            String msgcnt = msgData.get("msgcnt");
            if (msgcnt != null) {
                mBuilder.setNumber(Integer.parseInt(msgcnt));
            }

            String soundName = msgData.get("sound");
            if (soundName != null) {
                Resources r = context.getResources();
                int resourceId = r.getIdentifier(soundName, "raw", context.getPackageName());
                Uri soundUri = Uri.parse("android.resource://" + context.getPackageName() + "/" + resourceId);
                mBuilder.setSound(soundUri);
                defaults &= ~Notification.DEFAULT_SOUND;
                mBuilder.setDefaults(defaults);
            }

            final int largeIcon = getLargeIcon(context, msgData);
            if (largeIcon > -1) {
                Log.d(TAG, "Setting large icon... ");
                Bitmap bitmap = BitmapFactory.decodeResource(context.getResources(), largeIcon);
                mBuilder.setLargeIcon(bitmap);
            }

            final Notification notification = mBuilder.build();
            mNotificationManager.notify(appName, notId, notification);
        } catch (Exception e) {
            StringWriter stackTraceWriter = new StringWriter();
            e.printStackTrace(new PrintWriter(stackTraceWriter));

            Log.d(TAG, "Exception has been raised: " + e.getMessage() + " and stack trace: " + stackTraceWriter.toString());
        }
    }

    private static String getAppName(Context context) {
        CharSequence appName =
                context
                        .getPackageManager()
                        .getApplicationLabel(context.getApplicationInfo());

        return (String) appName;
    }

    private static int getColor(Map<String, String> extras) {
        int theColor = 0; // default, transparent
        final String passedColor = extras.get("color"); // something like "#FFFF0000", or "red"
        if (passedColor != null) {
            try {
                theColor = Color.parseColor(passedColor);
            } catch (IllegalArgumentException ignore) {
            }
        }
        return theColor;
    }

    private static int getSmallIcon(Context context, Map<String, String> extras) {

        int icon = -1;

        // first try an iconname possible passed in the server payload
        final String iconNameFromServer = extras.get("smallIcon");
        if (iconNameFromServer != null) {
            icon = getIconValue(context.getPackageName(), iconNameFromServer);
        }

        // try a custom included icon in our bundle named ic_stat_notify(.png)
        if (icon == -1) {
            icon = getIconValue(context.getPackageName(), "ic_stat_notify");
        }

        // fall back to the regular app icon
        if (icon == -1) {
            icon = context.getApplicationInfo().icon;
        }

        return icon;
    }

    private static int getLargeIcon(Context context, Map<String, String> extras) {

        int icon = -1;

        // first try an iconname possible passed in the server payload
        final String iconNameFromServer = extras.get("largeIcon");
        if (iconNameFromServer != null) {
            icon = getIconValue(context.getPackageName(), iconNameFromServer);
        }

        return icon;
    }

    private static int getIconValue(String className, String iconName) {
        try {
            Class<?> clazz = Class.forName(className + ".R$drawable");
            return (Integer) clazz.getDeclaredField(iconName).get(Integer.class);
        } catch (Exception ignore) {
        }
        return -1;
    }
}
