'use strict';

var Cloudant = require('cloudant');
var openwhisk = require('openwhisk');
var validator = require('validator');

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

function put(params) {
  const url = params.url;
  if (!validator.isURL('' + url)) {
    return Promise.reject(`invalid url: ${url}`);
  }
  let db = getCloudantDb(params);
  return db.insert({}, url).then(function(body) {
    console.log(JSON.stringify(body));
    return { payload: 'url added' };
  }).catch(function(err) {
    if (err.statusCode === 409) {
      return { payload: 'url already exists' };
    } else {
      return Promise.reject("failed adding url: " + JSON.stringify(err));
    }
  });
}

function del(params) {
  const url = params.url;
  if (!validator.isURL('' + url)) {
    return Promise.reject(`invalid url: ${url}`);
  }
  let db = getCloudantDb(params);
  return db.get(url, {revs_info: true}).then(function(body) {
    console.log(JSON.stringify(body));
    return db.destroy(url, body['_rev']).then(function(body) {
      return { payload: 'url deleted' };
    }).catch(function(err) {
      return Promise.reject("failed deleting url: " + JSON.stringify(err));
    });
  }).catch(function(err) {
    return Promise.reject("failed deleting url: " + JSON.stringify(err));
  });
}

function list(params) {
  let db = getCloudantDb(params);
  return db.list().then(function(body) {
    body.rows = body.rows.map(function(doc) {
      return {url: doc.id};
    });
    return body;
  });
}

function crawlCron(params) {
  let ow = openwhisk(),
      db = getCloudantDb(params),
      allPromises = [],
      batchSize = params.batch_size || 10;

  if (batchSize <= 0) {
    batchSize = 10;
  }

  return db.list().then(function(body) {
    for (let i = 0, j = body.rows.length; i < j; i += batchSize) {
      let docs = body.rows.slice(i, i + batchSize);
      allPromises.push(ow.actions.invoke({
        name: 'feed-aggregator-dev-crawl',
        blocking: false,
        result: false,
        params: {urls: docs.map(doc => doc.id)}
      }));
    };

    return Promise.all(allPromises).then(values => {
      return {body: values};
    });
  });
}

function feedcleaner(params) {
  let db = getCloudantDb(params);
  db.find({
    selector:{timestamp: {"$lte":Date.now() - 30*24*60*60*1000}},
    sort:[{"timestamp":"asc"}],
    limit:100
    }).then(function(result) {
 
    console.log('found %d docs', result.docs.length);
    for (var i = 0; i < result.docs.length; i++) {
      result.docs[i]._deleted = true;
    }

    db.bulk({docs: result.docs}).then(function(body) {
      console.log(body);
      return { payload: body };
    }).catch(function(error) {
      return Promise.reject("error cleaning feed: " + JSON.stringify(error));
    });
  }).catch(function(error) {
    console.log(error);
    return Promise.reject("error cleaning feed: " + JSON.stringify(error));
  });
}

exports.put = put;
exports.delete = del;
exports.list = list;
exports.crawlCron = crawlCron;
exports.feedcleaner = feedcleaner;
