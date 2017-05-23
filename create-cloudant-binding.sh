#!/bin/bash
CLOUDANTJSON=cloudant.json
USERNAME=`cat $CLOUDANTJSON | sed 's/\\\\\//\//g' | sed 's/[{}]//g' | awk -v k="text" '{n=split($0,a,","); for (i=1; i<=n; i++) print a[i]}' | sed 's/\"\:\"/\|/g' | sed 's/[\,]/ /g' | sed 's/\"//g'| grep -w username | cut -d":" -f2 | sed -e 's/^ *//g' -e 's/ *$//g'`
PASSWORD=`cat $CLOUDANTJSON | sed 's/\\\\\//\//g' | sed 's/[{}]//g' | awk -v k="text" '{n=split($0,a,","); for (i=1; i<=n; i++) print a[i]}' | sed 's/\"\:\"/\|/g' | sed 's/[\,]/ /g' | sed 's/\"//g' | grep -w password | cut -d":" -f2 | sed -e 's/^ *//g' -e 's/ *$//g'`
BINDING=`cat $CLOUDANTJSON | sed 's/\\\\\//\//g' | sed 's/[{}]//g' | awk -v k="text" '{n=split($0,a,","); for (i=1; i<=n; i++) print a[i]}' | sed 's/\"\:\"/\|/g' | sed 's/[\,]/ /g' | sed 's/\"//g' | grep -w package_binding_name | cut -d":" -f2 | sed -e 's/^ *//g' -e 's/ *$//g'`
wsk package bind /whisk.system/cloudant $BINDING \
  -p username $USERNAME \
  -p password $PASSWORD \
  -p host $USERNAME.cloudant.com
