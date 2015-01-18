#!/bin/bash
set -e

git config --global user.name "orabot"
git config --global user.email "orabot@users.noreply.github.com"

cd "$HOME"

mkdir -p "$HOME"/.ssh
cp "$TRAVIS_BUILD_DIR"/id_rsa "$HOME"/.ssh

git clone --branch=master git@github.com:OpenRA/openra.github.io.git openra.net > /dev/null
cd openra.net
cp -rf "$TRAVIS_BUILD_DIR"/output/* .

git add *
git commit -m "Deploy OpenRAWeb HTML to GitHub pages

commit: OpenRA/OpenRAWeb@$TRAVIS_COMMIT"

git push origin master
shred -u "$HOME"/.ssh/id_rsa
