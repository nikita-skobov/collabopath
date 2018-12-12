#!/usr/bin/env bash

FILES=()

DEFAULT_TTL="public,max-age=100"
DEBUG=false

# get command line arguments
for i in "$@"
do
case $i in
    -b=*|--bucket=*)
    BUCKET="${i#*=}"
    shift # past argument=value
    ;;
    -t=*|--ttl=*)
    TTLINDEX="${i#*=}"
    shift # past argument=value
    ;;
    -d=*|--debug=*)
    DEBUG=true
    shift
    ;;
    --default)
    DEFAULT=YES
    shift # past argument with no value
    ;;
    *)
    FILES[$ind]=$i
    ind=$((ind+1))
          # unknown option
    ;;
esac
done

if [ -z $TTLINDEX ]; then
  TTLINDEX=$DEFAULT_TTL
fi

aws s3 cp ./dist/semantic.min.css.gz s3://$BUCKET/semantic.min.css --content-encoding "gzip"

# # add in the script folder, no ttl necessary
aws s3 cp ./dist/scripts/ s3://$BUCKET/scripts/ --recursive --content-encoding "gzip"

# add in the index files with their index specific TTL
aws s3 cp ./dist/index.html s3://$BUCKET/ --cache-control $TTLINDEX
# uncomment these if you want to have extra folders for support, and about
#aws s3 cp ./dist/support/ s3://$BUCKET/support --recursive --cache-control $TTLINDEX
#aws s3 cp ./dist/about/ s3://$BUCKET/about --recursive --cache-control $TTLINDEX


# add in all the other files
if $DEBUG; then
  # use default ttl
  aws s3 cp ./dist/ s3://$BUCKET --recursive --exclude "index.html" --exclude "scripts/*" --exclude "about/*" --exclude "support/*" --exclude "semantic.min.css" --cache-control $DEFAULT_TTL
else
  # dont use any ttl
  aws s3 cp ./dist/ s3://$BUCKET --recursive --exclude "index.html" --exclude "scripts/*" --exclude "about/*" --exclude "support/*" --exclude "semantic.min.css"
fi
