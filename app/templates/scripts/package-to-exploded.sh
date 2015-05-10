#!/bin/bash

DIR=$( cd "$( dirname "$BASH_SOURCE[0]" )" && pwd )

CWD=$( pwd )
cd "$DIR/../exploded"
FILE="$( echo "$1" | sed 's|\.|\/|g' ).java"
echo "$( pwd )/$FILE"
cd "$CWD"
