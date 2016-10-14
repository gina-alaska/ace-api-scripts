var async = require('async');
var request = require('request');
var fs = require('fs');
var tmp = require('tmp');
var GeoJSON = require('geojson');
var loopback = require('./agents/loopback.js');

var adminAgent = new loopback('https://loopback/api');
var ckanPackageUrl = 'http://ckan/api/action/package_create';
var ckanResourceUrl = 'http://ckan/api/3/action/resource_create';

var startDate = process.argv[2];
var endDate = process.argv[3]

function createGeoJson(reports) {
  var points = [];
  reports.forEach(function (report) {
    var point = {
      lat: report.Position.latlng.lat,
      lng: report.Position.latlng.lng
    };

    var publicProperties = [
      'cloudCover',
      'precipitation',
      'visibility',
      'pressureTendency',
      'pressureValue',
      'temperatureValue',
      'temperatureUnits',
      'windValue',
      'windUnits',
      'windDirection',
      'notes',
      'other'
    ]

    publicProperties.forEach(function (key) {
      if(report[key] && report[key].length > 0) {
        point[key] = report[key];
      }
    });

    points.push(point);
  });

  return GeoJSON.parse(points, {Point: ['lat', 'lng']});
}

function ckanUpload(group, resourceName, geoJson, apiKey) {
  var authHeader = { 'Authorization' : apiKey };

  var tmpobj = tmp.dirSync();
  var filePath = tmpobj.name + '/data.geojson';
  fs.appendFileSync(filePath, JSON.stringify(geoJson));

  var packageTitle = 'Weather Reports from ' + startDate + ' to ' + endDate + ' (' + group.name + ')';
  var safeGroupName = group.name.toLowerCase().replace(/[^a-z0-9]/g, '');
  var packageName = safeGroupName + '_' + startDate + '_' + endDate;

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
    title: packageTitle,
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
          var geoJson = createGeoJson(reports.WeatherReports);
          ckanUpload(group, "Weather Reports", geoJson, ckanAdminKey);
        });
    })
  })
  .catch(function (err) {
    if (err) throw err;
  });
