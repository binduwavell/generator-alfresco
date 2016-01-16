#!/bin/bash

DIR=$( cd "$( dirname "$BASH_SOURCE[0]" )" && pwd )

CWD=$( pwd )
cd "$DIR/../exploded"
find $( pwd ) $@
cd "$CWD"
