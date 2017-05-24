'use strict';

var rp = require('request-promise');
var validator = require('validator');

function makerWebhook(params) {
  console.log(params);
  let makerWebhookKey = params.makerWebhook_key,
      id = params.id,
      changes = params.changes,
      dbname = params.dbname,
      deleted = params.deleted;

  if (!validator.isURL('' + id)) {
    return {payload: `ignored docs with non-url id=${id}`};
  }

  if (deleted) {
    return {payload: `ignored deleted docs`};
  }

  if (changes[0] && changes[0].rev.startsWith('1-')) {
    var webhook = {
      method: 'POST',
      uri: `https://maker.ifttt.com/trigger/feed-aggregator/with/key/${makerWebhookKey}`,
      body: {"value1": id},
      json: true // stringifies the body to JSON 
    };

    return rp(webhook).then(function (parsedBody) {
      console.log(parsedBody);
      return {body: parsedBody};
    }).catch(function (err) {
      console.log(err);
    });
  } else {
    return {payload: `ignored subsequent doc update rev=${changes[0].rev}`};
  }
}

exports.makerWebhook = makerWebhook;
