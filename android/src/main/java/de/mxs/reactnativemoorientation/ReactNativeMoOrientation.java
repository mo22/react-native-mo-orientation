package de.mxs.reactnativemoorientation;

import android.app.Activity;
import android.content.ComponentCallbacks;
import android.content.Context;
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

    private ComponentCallbacks componentCallbacks = new ComponentCallbacks() {
        @Override
        public void onConfigurationChanged(Configuration newConfig) {
            final WindowManager windowManager = (WindowManager)getReactApplicationContext().getSystemService(Context.WINDOW_SERVICE);
            if (windowManager == null) throw new RuntimeException("windowManager null");
            final Display display = windowManager.getDefaultDisplay();
            WritableMap args = Arguments.createMap();
            args.putInt("orientation", display.getRotation());
            getReactApplicationContext().getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("ReactNativeMoOrientation", args);
        }
        @Override
        public void onLowMemory() {
        }
    };

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
        stopOrientationEvent();
        super.onCatalystInstanceDestroy();
    }

    @SuppressWarnings("unused")
    @ReactMethod
    public void startOrientationEvent() {
        getReactApplicationContext().registerComponentCallbacks(componentCallbacks);
    }

    @SuppressWarnings({"unused", "WeakerAccess"})
    @ReactMethod
    public void stopOrientationEvent() {
        getReactApplicationContext().unregisterComponentCallbacks(componentCallbacks);
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
