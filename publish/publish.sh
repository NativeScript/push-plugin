#!/bin/bash

CURRENT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PACK_DIR="$CURRENT_DIR/package"

publish() {
    cd $PACK_DIR
    echo 'Publishing to npm...'
    npm publish *.tgz
}

./pack.sh && publish