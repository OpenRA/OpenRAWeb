#!/bin/bash

cd "$HOME"
git config --global user.email "orabot@users.noreply.github.com"
git config --global user.name "orabot"
git clone --branch=master https://${GITHUB_TOKEN}@github.com/OpenRA/openra.github.io openra.net || exit 1

cd openra.net || exit 1
cp -rf "$TRAVIS_BUILD_DIR"/output/* . || exit 1
git add *
git commit -m "Deploy OpenRAWeb HTML to GitHub pages

commit: OpenRA/OpenRAWeb@$TRAVIS_COMMIT"
git push origin master