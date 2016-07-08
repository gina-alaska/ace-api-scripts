// Load the promise-enabled version of the restler module.
var rest = require('restler-q');

module.exports = function loopback(url) {
  // The base LoopBack API URL.
  var baseUrl = url;

  // The authentication token.
  var token;

  // Accepts the relative login URL and username/password.
  function initialize(loginPath, credentials) {
    // Return promise so calling script knows when agent is authenticated.
    return new Promise(function (resolve, reject) {
      var url = baseUrl + loginPath;

      var options = {
        headers: {
          'Content-Type': 'application/json'
        },
        data: credentials
      };

      // POST username/password to LoopBack and save authentication token.
      rest.post(url, options)
        .then(function (response) {
          token = response.id;
          resolve();
        })
        .fail(function (err) {
          reject(err);
        });
    });
  }

  // Accepts any path that supports the GET operation.
  function get(loopbackPath) {
    // Promise resolves with array of results from GET operation.
    return new Promise(function (resolve, reject) {
      var url = baseUrl + loopbackPath + '?access_token=' + token;
      rest.get(url)
        .then(function (response) {
          resolve(response);
        })
        .fail(function (err) {
          reject(err);
        });
    });
  }

  // Export these functions.
  return {
    initialize: initialize,
    get: get
  };
};