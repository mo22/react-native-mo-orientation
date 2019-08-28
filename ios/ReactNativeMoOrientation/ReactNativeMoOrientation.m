#import <UIKit/UIKit.h>
#import <React/RCTEventEmitter.h>
#import <React/RCTUIManager.h>
#import <objc/runtime.h>

static void methodSwizzle(Class cls1, Class cls2, SEL sel) {
    Method m1 = class_getInstanceMethod(cls1, sel);
    Method m2 = class_getInstanceMethod(cls2, sel);
    IMP m2i = method_getImplementation(m2);
    if (m1 == nil) {
        class_addMethod(cls1, sel, m2i, method_getTypeEncoding(m1));
    } else {
        method_exchangeImplementations(m1, m2);
    }
}

UIInterfaceOrientationMask g_reactNativeMoOrientationMask = UIInterfaceOrientationMaskPortrait;

@interface ReactNativeMoOrientation : RCTEventEmitter
+ (void)setup;
+ (UIInterfaceOrientationMask)supportedInterfaceOrientationsForWindow:(UIWindow *)window;
@end

@implementation ReactNativeMoOrientation

RCT_EXPORT_MODULE()

+ (BOOL)requiresMainQueueSetup {
    return YES;
}

- (NSArray<NSString *> *)supportedEvents {
    return @[ @"ReactNativeMoOrientation" ];
}

+ (void)setup {
    static id<UIApplicationDelegate> appDelegate;
    if (appDelegate == nil) {
        methodSwizzle([[RCTSharedApplication() delegate] class], [self class], @selector(application:supportedInterfaceOrientationsForWindow:));
        appDelegate = RCTSharedApplication().delegate;
        [UIApplication sharedApplication].delegate = nil;
        RCTSharedApplication().delegate = appDelegate;
    }
}

- (instancetype)init {
    self = [super init];
    // @TODO: always?
    [ReactNativeMoOrientation setup];
    return self;
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

- (void)startObserving {
    // @TODO: rename to enableEvent...
    NSLog(@"ReactNativeMoOrientation.startObserving");
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(deviceOrientationDidChange:) name:UIDeviceOrientationDidChangeNotification object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(deviceOrientationDidChange:) name:UIApplicationDidChangeStatusBarOrientationNotification object:nil];
}

- (void)stopObserving {
    NSLog(@"ReactNativeMoOrientation.stopObserving");
    [[NSNotificationCenter defaultCenter] removeObserver:self name:UIDeviceOrientationDidChangeNotification object:nil];
    [[NSNotificationCenter defaultCenter] removeObserver:self name:UIApplicationDidChangeStatusBarOrientationNotification object:nil];
}

- (void)deviceOrientationDidChange:(NSNotification *)notification {
    UIDeviceOrientation deviceOrientation = [[UIDevice currentDevice] orientation];
    UIInterfaceOrientation interfaceOrientation = [[UIApplication sharedApplication] statusBarOrientation];
    [self sendEventWithName:@"ReactNativeMoOrientation" body:@{
        @"deviceOrientation": @(deviceOrientation),
        @"interfaceOrientation": @(interfaceOrientation),
    }];
}

RCT_EXPORT_METHOD(setOrientationMask:(int)mask) {
    NSLog(@"setOrientationMask %d", mask);
    g_reactNativeMoOrientationMask = mask;
    dispatch_async(dispatch_get_main_queue(), ^{
        [UIViewController attemptRotationToDeviceOrientation];
    });
}

RCT_EXPORT_METHOD(setOrientation:(int)orientation) {
    NSLog(@"setOrientation %d", orientation);
    dispatch_async(dispatch_get_main_queue(), ^{
        [[UIDevice currentDevice] beginGeneratingDeviceOrientationNotifications];
        [[UIDevice currentDevice] setValue:[NSNumber numberWithInteger:orientation] forKey:@"orientation"];
    });
}

// swizzled
- (UIInterfaceOrientationMask)application:(UIApplication *)application supportedInterfaceOrientationsForWindow:(UIWindow *)window {
    return [ReactNativeMoOrientation supportedInterfaceOrientationsForWindow:window];
}

+ (UIInterfaceOrientationMask)supportedInterfaceOrientationsForWindow:(UIWindow *)window {
    return g_reactNativeMoOrientationMask;
}

@end
