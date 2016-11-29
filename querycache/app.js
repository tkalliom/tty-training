const restify = require('restify');
const mongojs = require('mongojs');

var db = mongojs('mongodb://ordersdb/ordersDB');
db.on('error', err => console.log(err))

function serializeFilters(filterObj) {
  var filters = [];
  for (const key in filterObj) {
    filters.push(key + "=" + filterObj[key])
  }
  return filters.join(",");
}

function filtersFromQuery(query) {
  var ret = {};
  for (const key in query) {
    if (key.startsWith("filter_")) {
      ret[key.substring(7)] = query[key];
    }
  }
  return ret;
}

var fetchCollection = (function() {
  var cache = {};

  return function(name, query, callback) {
    const filters = filtersFromQuery(query);
    const filterString = serializeFilters(filters);

    if (name in cache && filterString in cache[name] && Date.now() - cache[name][filterString]["timestamp"] < 2000) {
      console.log("Serving request to " + name + " from cache");
      callback(null, cache[name][filterString]["results"]);
    } else {
      db.collection(name).find(filters, function (err, docs) {
        if (err) {
          console.log("DB find returned an error");
          callback(err);
        } else {
          console.log("DB find returned successfully");
          if (!(name in cache))
            cache[name] = {};
          if(!(filterString in cache[name]))
            cache[name][filterString] = {};
          cache[name][filterString]["timestamp"] = Date.now();
          cache[name][filterString]["results"] = docs;
          callback(null, docs);
        }
      });
    }
  }
})();

var server = restify.createServer();
server.use(restify.queryParser());
server.pre(restify.pre.sanitizePath());
server.get('/backend/:collection/', function(req, res, next) {
  fetchCollection(req.params.collection, req.query, (err, results) => err ? res.send(500, err) : res.send(200, {"rows": results}));
});
server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});
