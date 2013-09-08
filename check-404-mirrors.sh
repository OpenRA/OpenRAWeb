#!/bin/bash
find . -type f -iname '*-mirrors.txt' -exec sh -c 'for i in `grep ^http $1` ; do [[ -n `curl -Is $i |grep "404 Not Found"` ]] && echo $i ; done' -- '{}' \;
