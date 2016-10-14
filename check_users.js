var request = require('request-promise');
var underscore = require('underscore');
var loopback = require('./agents/loopback.js');

var adminAgent = new loopback('https://loopback/api');
var ckanUserListUrl = 'http://ckan/api/action/user_list';

var ckanAdminKey;
var ckanAdminId;
var loopbackUserIds;
var ckanUserIds;

adminAgent.initialize('/MobileUsers/login', {
  'username': 'admin',
  'password': 'password'
})
  .then(function () {
    return adminAgent.get('/MobileUsers?filter[where][username]=admin');
  })
  .then(function (users) {
    ckanAdminKey = users[0].apikey;
    ckanAdminId = users[0].id;
    return adminAgent.get('/MobileUsers');
  })
  .then(function (users) {
    loopbackUserIds = underscore.pluck(users, 'id');

    var authHeader = { 'Authorization' : ckanAdminKey };

    var userRequest = {
      url: ckanUserListUrl,
      headers: authHeader,
      method: 'GET'
    };

    return request(userRequest, function(error, response, body) {
      if (error) { return console.error('Request Failed:', error); }
      var users = JSON.parse(body);
      ckanUserIds = underscore.pluck(users.result, 'id');
    });
  })
  .then(function () {
    var missingInLoopback = [];
    var missingInCkan = [];

    loopbackUserIds.forEach(function (id) {
      if(id !== ckanAdminId && ckanUserIds.indexOf(id) === -1) {
        missingInCkan.push(id);
      }
    });

    ckanUserIds.forEach(function (id) {
      if(loopbackUserIds.indexOf(id) === -1) {
        missingInLoopback.push(id);
      }
    });

    if(missingInLoopback.length > 0) {
      console.log('In LoopBack but not CKAN:');
      missingInLoopback.forEach(function (id) {
        console.log(id);
      });
    }

    if(missingInCkan.length > 0) {
      console.log('In CKAN but not LoopBack:');
      missingInCkan.forEach(function (id) {
        console.log(id);
      });
    }
  })
  .catch(function (err) {
    if (err) throw err;
  });
