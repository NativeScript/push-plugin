package com.telerik.pushplugin;

import com.google.android.gms.iid.InstanceIDListenerService;


/**
 *  Listens for refresh of the Token made by GCM.
 */
public class InstanceIdListenerService extends InstanceIDListenerService {

    @Override
    public void onTokenRefresh() {
        PushPlugin.executeOnTokenRefreshCallback();
    }
}