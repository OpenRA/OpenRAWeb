#!/bin/bash

cd "$HOME"
git config --global user.email "travis@travis-ci.org"
git config --global user.name "travis-ci"
git clone --branch=master https://${GITHUB_TOKEN}@github.com/OpenRA/openra.github.io openra.net || exit 1

cd openra.net || exit 1
cp -rf "$TRAVIS_BUILD_DIR"/output/* . || exit 1
git add *
git commit -m "Deploy OpenRAWeb HTML to GitHub pages

travis build: $TRAVIS_BUILD_NUMBER
commit: $TRAVIS_COMMIT"
git push origin master