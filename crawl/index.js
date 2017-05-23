'use strict';

var Cloudant = require('cloudant');
var FeedParser = require('feedparser');
var request = require('request-promise');

function getCloudantDb(params) {
  let config = {
    username: params.cloudant_username,
    password: params.cloudant_password,
    db: params.cloudant_db
  };

  return Cloudant({
    account: config.username, 
    password: config.password, 
    plugin:'promises'
  }).db.use(config.db);
}

function main(params) {
  let feeds = params.urls,
      db = getCloudantDb(params),
      allPromises = [];

  for (let feed of feeds) {
    console.log(`crawl: ${feed}`);

    allPromises.push(new Promise(function(resolve, reject) {
      let options = {
        method: 'GET',
        uri: feed,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
        }
      };
      let req = request(options);
      req.on('error', function (error) {
        console.log('error: ' + error);
        reject('error: ' + feed + ': ' + error);
      });
      req.on('response', function (res) {
        if (res.statusCode !== 200) {
          console.log('error: ' + feed + ': ' + res.statusCode);
          reject('error: ' + feed + ': ' + res.statusCode);
        } else {
          let docs = [],
              feedparser = new FeedParser();

          feedparser.on('error', function (error) {
            console.log('error: ' + feed + ': ' + error);
            reject('error: ' + feed + ': ' + error);
          });
          feedparser.on('readable', function () {
            let item;
            while (item = this.read()) {
              let obj = {
                _id: item.link,
                title: item.title,
                link: item.link,
                pubDate: item.pubDate,
                guid: item.guid,
                timestamp: Date.parse(item.pubDate)
              }
              let now = Date.now();
              if (!item.pubDate) {
                obj.timestamp = now;
              }
              if (obj.timestamp > now) {
                obj.timestamp = now;
              }
              docs.push(obj);
            }
          });
          feedparser.on('end', function() {
            console.log(`feedparser end parsing ${feed}: \n${JSON.stringify(docs)}`);

            resolve(db.bulk({docs: docs}).then(function(body) {
              console.log(JSON.stringify(body));
              return { payload: body };
            }).catch(function(err) {
              if (err.statusCode === 409) {
                return { payload: 'items already exist' };
              } else {
                return Promise.reject("failed adding items: " + err);
              }
            }));
          });
          this.pipe(feedparser);
        }
      });
    }));
  }

  return Promise.all(allPromises).then(values => {
    return {body: values};
  });
}

exports.main = main;
