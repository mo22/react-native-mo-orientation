package de.mxs.reactnativemoorientation;

import android.app.Activity;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.res.Configuration;
import android.view.Display;
import android.view.WindowManager;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import javax.annotation.Nonnull;

public class ReactNativeMoOrientation extends ReactContextBaseJavaModule {

    private BroadcastReceiver configurationChangedReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            final WindowManager windowManager = (WindowManager)getReactApplicationContext().getSystemService(Context.WINDOW_SERVICE);
            if (windowManager == null) throw new RuntimeException("windowManager null");
            final Display display = windowManager.getDefaultDisplay();
            final Configuration newConfig = getReactApplicationContext().getResources().getConfiguration();
//            Log.i("XXX", "onConfigurationChanged " + newConfig.orientation + " " + display.getRotation());
//            if (display.getRotation() == Surface.ROTATION_0) Log.i("XXX", "rotation=ROTATION_0");
//            if (display.getRotation() == Surface.ROTATION_90) Log.i("XXX", "rotation=ROTATION_90");
//            if (display.getRotation() == Surface.ROTATION_180) Log.i("XXX", "rotation=ROTATION_180");
//            if (display.getRotation() == Surface.ROTATION_270) Log.i("XXX", "rotation=ROTATION_270 ");
//            if (newConfig.orientation == Configuration.ORIENTATION_PORTRAIT) Log.i("XXX", "orientation=ORIENTATION_PORTRAIT");
//            if (newConfig.orientation == Configuration.ORIENTATION_LANDSCAPE) Log.i("XXX", "orientation=ORIENTATION_LANDSCAPE");
            WritableMap args = Arguments.createMap();
            args.putInt("orientation", newConfig.orientation);
            args.putInt("rotation", display.getRotation());
            getReactApplicationContext().getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("ReactNativeMoOrientation", args);

        }
    };

    private boolean orientationEventEnabled = false;

    ReactNativeMoOrientation(@Nonnull ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public @Nonnull
    String getName() {
        return "ReactNativeMoOrientation";
    }

    @Override
    public void onCatalystInstanceDestroy() {
        enableOrientationEvent(false);
        super.onCatalystInstanceDestroy();
    }

    @SuppressWarnings({"unused", "WeakerAccess"})
    @ReactMethod
    public void enableOrientationEvent(boolean enable) {
        if (enable != orientationEventEnabled) {
            orientationEventEnabled = enable;
            if (enable) {
                IntentFilter intentFilter = new IntentFilter();
                intentFilter.addAction(Intent.ACTION_CONFIGURATION_CHANGED);
                getReactApplicationContext().registerReceiver(configurationChangedReceiver, intentFilter);
            } else {
                getReactApplicationContext().unregisterReceiver(configurationChangedReceiver);
            }
        }
    }

    @SuppressWarnings("unused")
    @ReactMethod
    public void setRequestedOrientation(int orientation) {
        final Activity activity = getCurrentActivity();
        if (activity == null) return;
        activity.setRequestedOrientation(orientation);
    }

    @SuppressWarnings("unused")
    @ReactMethod
    public void getOrientation(Promise promise) {
        final WindowManager windowManager = (WindowManager)getReactApplicationContext().getSystemService(Context.WINDOW_SERVICE);
        if (windowManager == null) throw new RuntimeException("windowManager null");
        final Display display = windowManager.getDefaultDisplay();
        promise.resolve(display.getRotation());
    }

}
