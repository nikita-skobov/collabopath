#!/usr/bin/env bash

# I am developing on windows, which doesnt have a zip program. so the hack Im using
# is to use 7zip to zip my folder.
"C:\Program Files\7-Zip\7z.exe" a -r start.zip -w start -mem=AES256
# after it zips up the start folder, it uploads it somewhere for the ec2 instances
# to access, but I cant expose this in the public files. sorry.