var loopback = require('./agents/loopback.js');

var loopbackAgent = new loopback('http://localhost:3000/api');

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
