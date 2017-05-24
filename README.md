
# Feed Aggregator

This program can merge a set of feeds (RSS/Atom) into a single one. It also has the capability to notify IFTTT Maker Webhook trigger to furhter integration, whenver there's new item from any of the source feeds.

## Getting Started

### Register account with IBM Bluemix and OpenWhisk

Before you can deploy your service to OpenWhisk, you need to have an account registered with the platform.

Please sign up for an account with [IBM Bluemix](https://console.ng.bluemix.net/) and then follow the instructions for getting access to [OpenWhisk on Bluemix](https://console.ng.bluemix.net/openwhisk/).

Create file `cloudant.json` based on `cloudant.json.template` and input your CloudantDB instance credential there.

### Register and Configure IFTTT

Create file `ifttt-makerWebhook.json` based on `makerWebhook.json.template` and input your key got from [here](https://ifttt.com/services/maker_webhooks/settings).

### Install Serverless Framework & Dependencies

```shell
$ npm install --global serverless serverless-openwhisk
```

**_This framework plugin requires Node.js runtime version 6.0 or above._**

### Create a CloudantDB service instance

Please create one instance on [Cloudant NoSQL DB on Bluemix](https://console.ng.bluemix.net/catalog/services/cloudant-nosql-db).

Create file `cloudant.json` based on `cloudant.json.template` and input your CloudantDB instance credential there.

### Deploy this program to Bluemix

```shell
./create-cloudant-binding.sh
./init-cloudant.sh
npm install
serverless deploy
```

### Add some feeds

```shell
./add_feed.sh https://bryantsai.com/feed
```
