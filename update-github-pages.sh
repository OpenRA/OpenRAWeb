#!/bin/bash
set -e

git config --global user.email "orabot@users.noreply.github.com"
git config --global user.name "orabot"
git config --global credential.helper "store --file=~/.git-credentials"
echo "https://$GH_TOKEN:@github.com" > ~/.git-credentials

cd "$HOME"
git clone --branch=master https://${GH_TOKEN}@github.com/OpenRA/openra.github.io openra.net > /dev/null
cd openra.net
cp -rf "$TRAVIS_BUILD_DIR"/output/* .

git add *
git commit -m "Deploy OpenRAWeb HTML to GitHub pages

commit: OpenRA/OpenRAWeb@$TRAVIS_COMMIT"

git push origin master
