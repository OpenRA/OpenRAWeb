#!/bin/bash
set -e

git config --global user.name "orabot"
git config --global user.email "orabot@users.noreply.github.com"

cd
mkdir -p .ssh

openssl aes-256-cbc -k "$KEY" -in "$TRAVIS_BUILD_DIR"/ssh.enc -d -out .ssh/id_rsa
chmod 0600 .ssh/id_rsa

git clone --branch=master git@github.com:OpenRA/openra.github.io.git openra.net > /dev/null
cd openra.net
cp -rf "$TRAVIS_BUILD_DIR"/output/* .

git add *
git commit -m "Deploy OpenRAWeb HTML to GitHub pages

commit: OpenRA/OpenRAWeb@$TRAVIS_COMMIT"

git push origin master
shred -u "$HOME"/.ssh/id_rsa
