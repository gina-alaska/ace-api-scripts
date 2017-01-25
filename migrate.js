var async = require('async');
var request = require('request');
var fs = require('fs');
var tmp = require('tmp');
var GeoJSON = require('geojson');
var url = require('url');
var loopback = require('./agents/loopback.js');

var adminAgent = new loopback('https://loopback/api');
var ckanPackageUrl = 'http://ckan/api/action/package_create';
var ckanResourceUrl = 'http://ckan/api/3/action/resource_create';
var ckanAdminKey = '';

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

function ckanUpload(group, resourceName, fileName, fileContents) {
  var authHeader = { 'Authorization' : ckanAdminKey };

  var tmpobj = tmp.dirSync();
  var filePath = tmpobj.name + '/' + fileName;
  var fileExtension = fileName.split('.').pop();

  if(fileExtension === 'geojson') {
    fs.appendFileSync(filePath, JSON.stringify(fileContents));
  } else {
    fs.appendFileSync(filePath, fileContents, 'binary');
  }

  var packageTitle = 'Weather Reports from ' + startDate + ' to ' + endDate + ' (' + group.name + ')';
  var safeGroupName = group.name.toLowerCase().replace(/[^a-z0-9]/g, '');
  var packageName = safeGroupName + '_' + startDate + '_' + endDate;

  var formData = {
    name: resourceName,
    description: resourceName,
    package_id: packageName,
    owner_org: group.id,
    url: 'http://placeholder.url',
    format: fileExtension,
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

adminAgent.initialize('/MobileUsers/login', {
  'username': 'admin',
  'password': 'password'
})
  .then(function (users) {
    return adminAgent.get('/Groups');
  })
  .then(function (groups) {
    groups.forEach(function (group) {
      return adminAgent.get('/WeatherReports/with-positions?groupId=' + group.id + '&startdate=' + startDate + '&enddate=' + endDate)
        .then(function (reports) {

          // Capture two things we need:
          // 1. API path to download the media file.
          // 2. The filename of this file.
          var regex = new RegExp('^/api(.*?([^\/]+))$');

          reports.WeatherReports.forEach(function (report) {
            var attachmentUrl = url.parse(report.attachment);

            var matches;
            if(matches = attachmentUrl.pathname.match(regex)) {
                var filePath = matches[1];
                var fileName = matches[2];
                var fileExtension = fileName.split('.').pop();

                var lat = report.Position.latlng.lat;
                var lng = report.Position.latlng.lng;

                // This converts the timestamp from LoopBack into a simple
                // YYYY-MM-DD date string that can be included in file names.
                var date = new Date(report.Position.timestamp).toISOString().slice(0, 10);

                // TODO: Find a better way to tie coordinates and times to
                // media files. Building a separate KML file to store this
                // metadata seems like a good option. Putting this metadata
                // directly in the filename should be considered a temporary
                // stopgap solution and not suitable for production.
                var newFileName = lat + '-' + lng + '-' + date + '.' + fileExtension;

                adminAgent.get(filePath)
                  .then(function (fileContent) {
                    ckanUpload(group, "Weather Reports", newFileName, fileContent);
                  });
            }
            adminAgent.get('/WeatherReports/with-positions?groupId=' + group.id + '&startdate=' + startDate + '&enddate=' + endDate);
          });
          var geoJson = createGeoJson(reports.WeatherReports);
          ckanUpload(group, "Weather Reports", 'data.geojson', geoJson);
        });
    })
  })
  .catch(function (err) {
    if (err) throw err;
  });
