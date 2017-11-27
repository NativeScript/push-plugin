#import <Foundation/Foundation.h>
#import <UIKit/UIApplication.h>

@interface Push : NSObject <UIApplicationDelegate>
{
    NSDictionary *notificationMessage;
    BOOL    isInline;
}

@property (nonatomic, strong) NSDictionary *notificationMessage;
@property BOOL isInline;
@property (nonatomic, retain) NSDictionary	*launchNotification;

+ (instancetype)sharedInstance;

-(void)register:(NSMutableDictionary *)options;
-(void)unregister;
-(void)areNotificationsEnabled;
-(void)registerUserNotificationSettings:(NSDictionary*)options;
-(void)setApplicationIconBadgeNumber:(NSMutableDictionary *)options;
-(void)didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken;
-(void)didFailToRegisterForRemoteNotificationsWithError:(NSError *)error;
-(void)notificationReceived;
-(void)success:(NSString *)eventName WithMessage:(NSString *)message;
-(void)success:(NSString *)eventName WithDictionary:(NSMutableDictionary *)userInfo;
-(void)fail:(NSString *)eventName WithMessage:(NSString *)message withError:(NSError *)error;
@end
