// Include the custom LoopBack agent module.
var loopback = require('./agents/loopback.js');

// Declare a new LoopBack agent with your local LoopBack API URL.
var loopbackAgent = new loopback('http://localhost:3000/api');

// Initialize the LoopBack agent by logging in to the /MobileUsers
// endpoint. The LoopBack agent will save the authentication token
// internally for use in all subsequent requests.
loopbackAgent.initialize('/MobileUsers/login', {
  'username': 'testuser',
  'password': 'password'
})
  .then(function () {
    // The asynchronous loopbackAgent.initialize() task has finished.
    //
    // Download all weather reports using the GET operation on
    // LoopBack's /WeatherReports endpoint. You can see that your
    // local LoopBack API supports the GET operation on the
    // /WeatherReports endpoint via the "Explorer" interface at:
    // http://localhost:3000/explorer/
    return loopbackAgent.get('/WeatherReports');
  })
  .then(function (results) {
    // The asynchronous loopbackAgent.get() task has finished.
    //
    // Output the results of the GET operation.
    console.log(results);
  });
