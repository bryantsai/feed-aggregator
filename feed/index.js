'use strict';

var Cloudant = require('cloudant');
var RSS = require('rss');

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
  var feed = new RSS({
    title: 'bryantsai\'s feed aggregator',
    ttl: '60'
  });

  let db = getCloudantDb(params);
  return db.find({
      selector:{"$and":[{timestamp: {"$gte":0}}, {timestamp: {"$lte":Date.now()}}]},
      sort:[{"timestamp":"desc"}],
      limit:20
      }).then(function(body) {
    for (var i = 0; i < body.docs.length; i++) {
      feed.item({
        title: body.docs[i].title,
        url: body.docs[i]._id,
        guid: body.docs[i].guid,
        date: body.docs[i].pubDate
      });
    }

    var xml = feed.xml({indent: true});
    console.log(xml);
    return {
      body: xml,
      headers: {
        'Content-Type': 'application/rss+xml; charset=UTF-8'
      },
      statusCode: 200
    };
  });
}

exports.main = main;
