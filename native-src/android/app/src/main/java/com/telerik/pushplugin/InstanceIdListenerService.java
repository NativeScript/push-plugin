package com.telerik.pushplugin;

import com.google.firebase.iid.FirebaseInstanceIdService;

/**
 *  Listens for refresh of the Token made by GCM.
 */
public class InstanceIdListenerService extends FirebaseInstanceIdService {

    @Override
    public void onTokenRefresh() {
        PushPlugin.executeOnTokenRefreshCallback();
    }
}
