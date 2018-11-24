#!/usr/bin/env bash

FILES=(1, 2, 3)

ind=0

for i in "$@"
do
case $i in
    -p=*|--prefix=*)
    PREFIX="${i#*=}"
    shift # past argument=value
    ;;
    -w=*|--width=*)
    WIDTH="${i#*=}"
    shift # past argument=value
    ;;
    -l=*|--lib=*)
    LIBPATH="${i#*=}"
    shift # past argument=value
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
echo "PREFIX          = ${PREFIX}"
echo "WIDTH           = ${WIDTH}"

if [ -z $WIDTH ]; then
  echo "width empty"
  WIDTH="1080"
fi

strindex() { 
  x="${1%%$2*}"
  [[ "$x" = "$1" ]] && echo -1 || echo "${#x}"
}

for i in "${FILES[@]}"; do
  # only process if the filename is longer than 2 chars
  if [ ${#i} -gt 2 ]; then
    echo $i
    slashIndex=$(strindex $i "/")
    if [ $slashIndex -ne -1 ]; then
      # if the user specified a file within a folder
      # then store the folder as a variable for the output
      folder=$(echo $i | cut -c1-$slashIndex)
      filenameLength=$((${#i} - $slashIndex - 1))
      filename=${i:(-$filenameLength)}
      ffmpeg -i $i -vf scale="$WIDTH:-1" "$folder/$PREFIX$filename"
      # ffmpeg -i $i -vf scale="iw/1:ih/1" "$folder/$PREFIX$filename"
    else
      ffmpeg -i $i -vf scale="$WIDTH:-1" "$PREFIX$i"
    fi
    echo $slashIndex
  fi
  #ffmpeg -i $i -vf scale="iw/1:ih/1" "output_$i"
done
# echo "Number files in SEARCH PATH with EXTENSION:" $(ls -1 "${SEARCHPATH}"/*."${EXTENSION}" | wc -l)
# if [[ -n $1 ]]; then
#     echo "Last line of file specified as non-opt/last argument:"
#     tail -1 $1
# fi
# for i in {1..5}; do
#   echo $()
# done

# echo $1
# echo $2
# echo $3
