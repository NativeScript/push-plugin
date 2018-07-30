#!/bin/bash
set -e
set -o pipefail

CURRENT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
SOURCE_DIR="$CURRENT_DIR/../src"
TO_SOURCE_DIR="$CURRENT_DIR/src"
PACK_DIR="$CURRENT_DIR/package"
ROOT_DIR="$CURRENT_DIR/.."
PUBLISH=--publish

# pass native android or ios as arguments to skip native building
ARGS={$1""}

install(){
    cd $CURRENT_DIR
    npm i
}

pack() {
    echo 'Clearing /src and /package...'
    node_modules/.bin/rimraf "$TO_SOURCE_DIR"
    node_modules/.bin/rimraf "$PACK_DIR"

    cd $SOURCE_DIR
    npm i
    cd $CURRENT_DIR

    if [[ $ARGS != *"native"* ]]; then

        if [ $ARGS != *"android"* ]; then
            # compile native android
            echo 'Building native android...'
            ./build-android.sh
        else
            echo 'Building native android was skipped...'
        fi

        if [ $ARGS != *"ios"* ]; then
            # compile native ios
            echo 'Building native ios...'
            ./build-ios.sh
        else
            echo 'Building native ios was skipped...'
        fi
    else
        echo "Native build was skipped, using existing native binaries..."
    fi

    # copy src
    echo 'Copying src...'
    node_modules/.bin/ncp "$SOURCE_DIR" "$TO_SOURCE_DIR"

    # copy LICENSE to src
    echo 'Copying README & LICENSE to /src...'
    node_modules/.bin/ncp "$ROOT_DIR"/LICENSE.md "$TO_SOURCE_DIR"/LICENSE.md
    node_modules/.bin/ncp "$ROOT_DIR"/README.md "$TO_SOURCE_DIR"/README.md

    # compile package and copy files required by npm
    echo 'Building /src...'
    cd "$TO_SOURCE_DIR"
    node_modules/.bin/tsc
    cd ..

    echo 'Creating package...'
    # create package dir
    mkdir "$PACK_DIR"

    # create the package
    cd "$PACK_DIR"
    npm pack "$TO_SOURCE_DIR"
    echo "Package created in $PACK_DIR"

    # delete source directory used to create the package
    cd ..
    node_modules/.bin/rimraf "$TO_SOURCE_DIR"
}

install && pack
