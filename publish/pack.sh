#!/bin/bash

SOURCE_DIR=../src;
TO_SOURCE_DIR=src;
PACK_DIR=package;
ROOT_DIR=..;
PUBLISH=--publish

install(){
    npm i
}

pack() {
    echo 'Building plugin package...'
    echo '--------------------------'
    echo 'NOTE: This plugin contains native libraries for Android and iOS, which should be built separately if you have made changes to them!'
    echo 'If you have updated the ./native-src/android/ or ./native-src/ios/ projects and the binaries, you must run this pack script again.'
    echo '--------------------------'

    echo 'Clearing "'$TO_SOURCE_DIR'" and "'$PACK_DIR'"...'
    node_modules/.bin/rimraf "$TO_SOURCE_DIR"
    node_modules/.bin/rimraf "$PACK_DIR"

    # copy src
    echo 'Copying "'$SOURCE_DIR'" to "'$TO_SOURCE_DIR'"...'
    node_modules/.bin/ncp "$SOURCE_DIR" "$TO_SOURCE_DIR"

    # copy README & LICENSE to src
    echo 'Copying README and LICENSE to "'$TO_SOURCE_DIR'"...'
    node_modules/.bin/ncp "$ROOT_DIR"/LICENSE "$TO_SOURCE_DIR"/LICENSE
    node_modules/.bin/ncp "$ROOT_DIR"/README.md "$TO_SOURCE_DIR"/README.md

    # compile package and copy files required by npm
    echo 'Building "'$TO_SOURCE_DIR'"...'
    cd "$TO_SOURCE_DIR"
    node_modules/.bin/tsc
    cd ..

    echo 'Creating package...'
    # create package dir
    mkdir "$PACK_DIR"

    # create the package
    cd "$PACK_DIR"
    npm pack ../"$TO_SOURCE_DIR"

    # delete source directory used to create the package
    cd ..
    node_modules/.bin/rimraf "$TO_SOURCE_DIR"
}

install && pack