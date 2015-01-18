#!/bin/bash
rm -rf ./output
git clone https://github.com/OpenRA/openra.github.io.git output
nanoc compile
cd output
git add *
git commit -m 'Deploy OpenRAWeb HTML to GitHub pages'
git push origin master