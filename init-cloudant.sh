#!/bin/bash
CLOUDANTJSON=cloudant.json
USERNAME=`cat $CLOUDANTJSON | sed 's/\\\\\//\//g' | sed 's/[{}]//g' | awk -v k="text" '{n=split($0,a,","); for (i=1; i<=n; i++) print a[i]}' | sed 's/\"\:\"/\|/g' | sed 's/[\,]/ /g' | sed 's/\"//g'| grep -w username | cut -d":" -f2 | sed -e 's/^ *//g' -e 's/ *$//g'`
PASSWORD=`cat $CLOUDANTJSON | sed 's/\\\\\//\//g' | sed 's/[{}]//g' | awk -v k="text" '{n=split($0,a,","); for (i=1; i<=n; i++) print a[i]}' | sed 's/\"\:\"/\|/g' | sed 's/[\,]/ /g' | sed 's/\"//g' | grep -w password | cut -d":" -f2 | sed -e 's/^ *//g' -e 's/ *$//g'`
DBFEEDS=`cat $CLOUDANTJSON | sed 's/\\\\\//\//g' | sed 's/[{}]//g' | awk -v k="text" '{n=split($0,a,","); for (i=1; i<=n; i++) print a[i]}' | sed 's/\"\:\"/\|/g' | sed 's/[\,]/ /g' | sed 's/\"//g' | grep -w db_feeds | cut -d":" -f2 | sed -e 's/^ *//g' -e 's/ *$//g'`
DBITEMS=`cat $CLOUDANTJSON | sed 's/\\\\\//\//g' | sed 's/[{}]//g' | awk -v k="text" '{n=split($0,a,","); for (i=1; i<=n; i++) print a[i]}' | sed 's/\"\:\"/\|/g' | sed 's/[\,]/ /g' | sed 's/\"//g' | grep -w db_items | cut -d":" -f2 | sed -e 's/^ *//g' -e 's/ *$//g'`
curl -X POST -u "$USERNAME:$PASSWORD" https://$USERNAME.cloudant.com/$DBFEEDS
curl -X POST -u "$USERNAME:$PASSWORD" https://$USERNAME.cloudant.com/$DBITEMS
curl -X POST -u "$USERNAME:$PASSWORD" -H Content-Type:application/json --data '{"index": {"fields": ["timestamp"]},"type": "json"}' https://$USERNAME.cloudant.com/$DBITEMS/_index
