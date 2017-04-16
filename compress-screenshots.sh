#!/bin/bash
pushd content/images/news/
    for f in *.png;
    do
        echo "Processing $f"
        convert $f -type Palette $f
    done
popd
