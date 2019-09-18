#import <UIKit/UIKit.h>
#import <React/RCTEventEmitter.h>
#import <React/RCTUIManager.h>
#import <objc/runtime.h>

static void methodSwizzle(Class cls1, SEL sel1, Class cls2, SEL sel2) {
    Method m1 = class_getInstanceMethod(cls1, sel1); // original
    Method m2 = class_getInstanceMethod(cls2, sel2); // new
    assert(m2);
    if (m1) {
        assert(class_addMethod(cls1, sel2, method_getImplementation(m1), method_getTypeEncoding(m1)));
        method_exchangeImplementations(m1, m2);
    } else {
        assert(class_addMethod(cls1, sel1, method_getImplementation(m2), method_getTypeEncoding(m2)));
    }
}

UIInterfaceOrientationMask g_reactNativeMoOrientationMask = -1; // UIInterfaceOrientationMaskPortrait;

@interface ReactNativeMoOrientation : RCTEventEmitter {
    BOOL _verbose;
}
@end

@implementation ReactNativeMoOrientation

RCT_EXPORT_MODULE()

+ (BOOL)requiresMainQueueSetup {
    return YES;
}

// we are interacting with UI
- (dispatch_queue_t)methodQueue {
    return dispatch_get_main_queue();
}

- (NSArray<NSString *> *)supportedEvents {
    return @[ @"ReactNativeMoOrientation" ];
}

+ (void)swizzleSupportedInterfaceOrientationsForWindow {
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        id<UIApplicationDelegate> appDelegate = [RCTSharedApplication() delegate];
        methodSwizzle(
            [appDelegate class], @selector(application:supportedInterfaceOrientationsForWindow:),
            [self class], @selector(swizzled_application:supportedInterfaceOrientationsForWindow:)
        );
//        RCTSharedApplication().delegate = nil; // @TODO: is this needed?
        RCTSharedApplication().delegate = appDelegate;
    });
}

- (NSDictionary *)constantsToExport {
    NSMutableDictionary* constants = [NSMutableDictionary new];
    UIDeviceOrientation deviceOrientation = [[UIDevice currentDevice] orientation];
    UIInterfaceOrientation interfaceOrientation = [[UIApplication sharedApplication] statusBarOrientation];
    constants[@"initialOrientation"] = @{
        @"deviceOrientation": @(deviceOrientation),
        @"interfaceOrientation": @(interfaceOrientation),
    };
    return constants;
}

RCT_EXPORT_METHOD(setVerbose:(BOOL)verbose) {
    _verbose = verbose;
}

RCT_EXPORT_METHOD(enableOrientationEvent:(BOOL)enable) {
    if (enable) {
        [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(deviceOrientationDidChange:) name:UIDeviceOrientationDidChangeNotification object:nil];
        [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(deviceOrientationDidChange:) name:UIApplicationDidChangeStatusBarOrientationNotification object:nil];
    } else {
        [[NSNotificationCenter defaultCenter] removeObserver:self name:UIDeviceOrientationDidChangeNotification object:nil];
        [[NSNotificationCenter defaultCenter] removeObserver:self name:UIApplicationDidChangeStatusBarOrientationNotification object:nil];
    }
}

- (void)stopObserving {
    [self enableOrientationEvent:NO];
}

- (void)deviceOrientationDidChange:(NSNotification *)notification {
    UIDeviceOrientation deviceOrientation = [[UIDevice currentDevice] orientation];
    UIInterfaceOrientation interfaceOrientation = [[UIApplication sharedApplication] statusBarOrientation];
    if (_verbose) NSLog(@"ReactNativeMoOrientation.deviceOrientationDidChange device=%ld interface=%ld", (long)deviceOrientation, (long)interfaceOrientation);
    [self sendEventWithName:@"ReactNativeMoOrientation" body:@{
        @"deviceOrientation": @(deviceOrientation),
        @"interfaceOrientation": @(interfaceOrientation),
    }];
}

RCT_EXPORT_METHOD(setOrientationMask:(int)mask) {
    if (_verbose) NSLog(@"ReactNativeMoOrientation.setOrientationMask %d", mask);
    g_reactNativeMoOrientationMask = mask;
    [[self class] swizzleSupportedInterfaceOrientationsForWindow];
    [UIViewController attemptRotationToDeviceOrientation];
}

RCT_EXPORT_METHOD(setOrientation:(int)orientation) {
    if (_verbose) NSLog(@"ReactNativeMoOrientation.setOrientation %d", orientation);
    [[UIDevice currentDevice] beginGeneratingDeviceOrientationNotifications];
    [[UIDevice currentDevice] setValue:[NSNumber numberWithInteger:orientation] forKey:@"orientation"];
}

- (UIInterfaceOrientationMask)swizzled_application:(UIApplication *)application supportedInterfaceOrientationsForWindow:(UIWindow *)window {
    if (g_reactNativeMoOrientationMask == -1) {
        if ([self respondsToSelector:@selector(swizzled_application:supportedInterfaceOrientationsForWindow:)]) {
            return [self swizzled_application:application supportedInterfaceOrientationsForWindow:window];
        } else {
            return UIInterfaceOrientationMaskPortrait;
        }
    } else {
        return [ReactNativeMoOrientation supportedInterfaceOrientationsForWindow:window];
    }
}

+ (UIInterfaceOrientationMask)supportedInterfaceOrientationsForWindow:(UIWindow *)window {
    if (g_reactNativeMoOrientationMask == -1) {
        return UIInterfaceOrientationMaskPortrait;
    } else {
        return g_reactNativeMoOrientationMask;
    }
}

@end
