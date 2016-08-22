var async = require('async');
var request = require('request');
var fs = require('fs');
var tmp = require('tmp');
var loopback = require('./agents/loopback.js');

var adminAgent = new loopback('http://localhost:3000/api');
var ckanPackageUrl = 'http://localhost:5000/api/action/package_create';
var ckanResourceUrl = 'http://localhost:5000/api/3/action/resource_create';

var sinceDate = process.argv[2]

function ckanUpload(packageName, resourceName, geoJson, groupId, apiKey, callback) {
  var authHeader = { 'Authorization' : apiKey };

  tmp.file(function (err, path, fd, cleanup) {
    if (err) throw err;
    fs.appendFile(path, JSON.stringify(geoJson));

    var formData = {
      name: resourceName,
      description: resourceName,
      package_id: packageName,
      owner_org: groupId,
      url: 'http://placeholder.url',
      format: 'geojson',
      upload: fs.createReadStream(path)
    }

    var packageDetails = {
      name: packageName,
      notes: '',
      state: 'active',
      owner_org: groupId
    }

    var packageRequest = {
      url: ckanPackageUrl,
      headers: authHeader,
      method: 'POST',
      json: packageDetails
    };

    var resourceRequest = {
      url: ckanResourceUrl,
      headers: authHeader,
      method: 'POST',
      formData: formData
    };

    request(packageRequest, function(error, response, body) {
      if (error) { return console.error('Request Failed:', error); }
      request(resourceRequest, function(error, response, body) {
        if (error) { return console.error('Request Failed:', error); }
        callback();
      });
    });
  });
}

adminAgent.initialize('/MobileUsers/login', {
  'username': 'admin',
  'password': 'password'
})
  .then(function () {
    return adminAgent.get('/MobileUsers?filter[where][username][neq]=admin');
  })
  .then(function (users) {
    return async.eachLimit(users, 3, function (user, callback) {
      adminAgent.get('/WeatherReports/with-positions?userId=' + user.id + '&date=' + sinceDate)
        .then(function (reports) {
          async.eachLimit(reports, 3, function (report, callback) {
            ckanUpload(sinceDate, user.username, report, user.groupId, user.apikey, callback);
          });
        });
    });
  })
  .catch(function (err) {
    if (err) throw err;
  });
