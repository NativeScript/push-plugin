set -e
set -o pipefail

CURRENT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

SOURCE_NAME="PushPlugin"
IOS_SOURCE_DIR="$CURRENT_DIR/../src-native/ios"

PROJECT_NAME="$SOURCE_NAME.xcodeproj"
TARGET_NAME="$SOURCE_NAME"
FRAMEWORK_NAME="$SOURCE_NAME"

BUILD_DIR="$IOS_SOURCE_DIR/build/intermediates/${FRAMEWORK_NAME}"
BUILD_FOR_DEVICE_DIR="$BUILD_DIR/Release-iphoneos"
BUILD_FOR_SIMULATOR_DIR="$BUILD_DIR/Release-iphonesimulator"
BUILD_OUTPUT_DIR="$IOS_SOURCE_DIR/build/outputs"

PLUGIN_TARGET_DIR="$CURRENT_DIR/../src/platforms"
PLUGIN_TARGET_SUBDIR="$PLUGIN_TARGET_DIR/ios"

cd $IOS_SOURCE_DIR

if [ -d "$BUILD_DIR" ]; then
    rm -rf "$BUILD_DIR"
fi

echo "Build for iphonesimulator"
xcodebuild -project $PROJECT_NAME -scheme $TARGET_NAME \
    -configuration Release \
    -sdk iphonesimulator \
    GCC_PREPROCESSOR_DEFINITIONS='$GCC_PREPROCESSOR_DEFINITIONS ' \
    CONFIGURATION_BUILD_DIR=$BUILD_FOR_SIMULATOR_DIR \
    clean build -quiet

echo "Build for iphoneos"
xcodebuild -project $PROJECT_NAME -scheme $TARGET_NAME \
    -configuration Release \
    -sdk iphoneos \
    GCC_PREPROCESSOR_DEFINITIONS='$GCC_PREPROCESSOR_DEFINITIONS ' \
    CONFIGURATION_BUILD_DIR=$BUILD_FOR_DEVICE_DIR \
    clean build archive -quiet

if [ -d "$BUILD_OUTPUT_DIR/$FRAMEWORK_NAME.framework" ]; then
    rm -rf "$BUILD_OUTPUT_DIR/$FRAMEWORK_NAME.framework"
fi

mkdir -p "$BUILD_OUTPUT_DIR/$FRAMEWORK_NAME.framework"

cp -fr "$BUILD_FOR_DEVICE_DIR/$FRAMEWORK_NAME.framework/$FRAMEWORK_NAME.framework" "$BUILD_OUTPUT_DIR"

echo "Build fat framework"
xcrun -sdk iphoneos lipo -create \
    $BUILD_FOR_SIMULATOR_DIR/$FRAMEWORK_NAME.framework/$FRAMEWORK_NAME \
    $BUILD_FOR_DEVICE_DIR/$FRAMEWORK_NAME.framework/$FRAMEWORK_NAME.framework/$FRAMEWORK_NAME \
-o "$BUILD_OUTPUT_DIR/$FRAMEWORK_NAME.framework/$FRAMEWORK_NAME"

rm -rf $BUILD_DIR

echo "$FRAMEWORK_NAME.framework was built in $BUILD_OUTPUT_DIR"

if [ ! -d $PLUGIN_TARGET_DIR ]; then
    mkdir $PLUGIN_TARGET_DIR
fi

if [ ! -d $PLUGIN_TARGET_SUBDIR ]; then
    mkdir $PLUGIN_TARGET_SUBDIR
fi

cp -R "$BUILD_OUTPUT_DIR/$FRAMEWORK_NAME.framework" $PLUGIN_TARGET_SUBDIR

echo "iOS Framework was copied to $PLUGIN_TARGET_SUBDIR"

cd $CURRENT_DIR
