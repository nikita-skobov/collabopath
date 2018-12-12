#!/usr/bin/env bash

gzip -r ./dist/scripts

gzip ./dist/og.semantic.min.css

for filename in ./dist/scripts/*.gz; do
  newfilename=${filename::-3}
  mv "$filename" "$newfilename"
done
