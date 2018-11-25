#!/usr/bin/env bash

FILES=()

DEFAULT_TTL=100
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
    TTL="${i#*=}"
    shift # past argument=value
    ;;
    -ti=*|--ttl-index=*)
    TTLINDEX="${i#*=}"
    shift
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
  TTLINDEX=$TTL
fi
if [ -z $TTLINDEX ]; then
  TTL=$DEFAULT_TTL
  TTLINDEX=$DEFAULT_TTL
fi

# add in the script folder, no ttl necessary
aws s3 cp ./dist/scripts/ s3://$BUCKET/scripts/

# add in the index files with their index specific TTL
aws s3 cp ./dist/index.html s3://$BUCKET/ --cache-control $TTLINDEX


if $DEBUG; then
  # use default ttl
  #aws s3 cp ./dist/ s3://$BUCKET/ --cache-control $DEFAULT_TTL
  echo ayy
else
  echo bayy
  # dont use any ttl
  #aws s3 cp ./dist/ s3://$BUCKET/
fi
