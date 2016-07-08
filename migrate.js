var loopback = require('./agents/loopback.js');

var loopbackAgent = new loopback('http://137.229.94.246:3000/api');

loopbackAgent.initialize('/MobileUsers/login', {
  'username': 'testuser',
  'password': 'password'
})
  .then(function () {
    return loopbackAgent.get('/WeatherReports');
  })
  .then(function (results) {
    console.log(results);
  });
