#!/bin/bash
echo Content-type: text/plain
#set -e -x
echo
#pwd
#whoami
export PATH=/home/openra/.gems/bin:/usr/lib/ruby/gems/1.8/bin:$PATH
export GEM_PATH=/home/openra/.gems:/usr/lib/ruby/gems/1.8:$GEM_PATH
#env
git fetch origin
git reset --hard origin/master
nanoc compile
echo DONE
