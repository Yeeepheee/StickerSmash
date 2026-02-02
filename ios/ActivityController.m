#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(ActivityController, NSObject)

RCT_EXTERN_METHOD(startLiveActivity:(double)endTime timerName:(NSString *)timerName)
RCT_EXTERN_METHOD(stopLiveActivity)

@end
