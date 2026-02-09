#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(ActivityController, NSObject)

// Match the signature: startLiveActivity(endTime, title, timerId)
RCT_EXTERN_METHOD(startLiveActivity:(double)endTime title:(NSString *)title timerId:(NSString *)timerId)

// Match the signature: stopLiveActivity(timerId)
RCT_EXTERN_METHOD(stopLiveActivity:(NSString *)timerId)

@end