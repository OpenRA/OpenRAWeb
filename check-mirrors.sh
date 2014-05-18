#!/bin/bash
pushd content/packages
find . -iname '*.txt' -exec cat {} ';' | xargs -n1 wget --spider --timeout=5 --tries=1
popd