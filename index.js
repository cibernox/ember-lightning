'use strict';

const redis = require('redis'),
    co = require('co'),
    coRedis = require('co-redis'),
    Koa = require('koa');

const app = exports.app = new Koa(),
    client  = redis.createClient(process.env.REDIS_URL),
    dbCo = coRedis(client);

if (process.env.REDIS_SECRET) {
  client.auth(process.env.REDIS_SECRET);
}

client.on('error', function (err) {
  console.log('Redis client error: ' + err);
});

app.use(co.wrap(function* (ctx) {
  var indexkey;

  if (ctx.request.query.index_key) {
    console.log(process.env.APP_NAME +':index:'+ ctx.request.query.index_key);
    indexkey = process.env.APP_NAME +':index:'+ ctx.request.query.index_key;
  } else {
    console.log(process.env.APP_NAME +':index:current-content');
    indexkey = process.env.APP_NAME +':index:current-content';
  }
  var index = yield dbCo.get(indexkey);

  if (index) {
    console.log(index);
    ctx.body = index;
  } else {
    console.log('not found');
    ctx.status = 404;
  }
}));

var server = app.listen(process.env.PORT || 3000);

process.on('SIGINT', function () {
  server.close(function () {
    process.exit(0);
  });
});
