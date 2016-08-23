var async = require('async');
var request = require('request');
var fs = require('fs');
var tmp = require('tmp');
var loopback = require('./agents/loopback.js');

var adminAgent = new loopback('http://localhost:3000/api');
var ckanPackageUrl = 'http://localhost:5000/api/action/package_create';
var ckanResourceUrl = 'http://localhost:5000/api/3/action/resource_create';

var startDate = process.argv[2];
var endDate = process.argv[3]

function ckanUpload(group, resourceName, geoJson, apiKey) {
  var authHeader = { 'Authorization' : apiKey };

  var tmpobj = tmp.dirSync();
  var filePath = tmpobj.name + '/data.json';
  fs.appendFile(filePath, JSON.stringify(geoJson));

  var safeGroupName = group.name.toLowerCase().replace(/[^a-z0-9]/g, '');
  var packageName = safeGroupName + '_' + startDate;

  var formData = {
    name: resourceName,
    description: resourceName,
    package_id: packageName,
    owner_org: group.id,
    url: 'http://placeholder.url',
    format: 'geojson',
    upload: fs.createReadStream(filePath)
  }

  var packageDetails = {
    name: packageName,
    notes: '',
    state: 'active',
    owner_org: group.id
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
      fs.unlinkSync(filePath);
    });
  });
}

var ckanAdminKey;
adminAgent.initialize('/MobileUsers/login', {
  'username': 'admin',
  'password': 'password'
})
  .then(function () {
    return adminAgent.get('/MobileUsers?filter[where][username]=admin');
  })
  .then(function (users) {
    ckanAdminKey = users[0].apikey;
    return adminAgent.get('/Groups');
  })
  .then(function (groups) {
    groups.forEach(function (group) {
      return adminAgent.get('/WeatherReports/with-positions?groupId=' + group.id + '&startdate=' + startDate + '&enddate=' + endDate)
        .then(function (reports) {
          ckanUpload(group, "Weather Reports", reports, ckanAdminKey);
        });
    })
  })
  .catch(function (err) {
    if (err) throw err;
  });
