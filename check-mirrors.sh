#!/bin/bash
find . -iname '*-mirrors.txt' -exec cat {} ';' | xargs -n1 ./check.sh | grep HTTP
