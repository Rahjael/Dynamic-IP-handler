'use strict';

const CONFIG = require('./config');




requestIp(CONFIG.serviceName);








/**
 * Requests an ip to the Google API
 * @param {string} serviceName - The name of the service for which an IP is needed
 */
 function requestIp(serviceName) {
  const data = {
    authCode: CONFIG.authCode,
    requestType: 'REQUEST_IP',
    serviceName: serviceName
  }

  fetch(CONFIG.fetchUrl, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {'Content-type': 'application/json; charset=UTF-8'}
  })
  .then(response => {
    console.log('done');
    return response.json();
  })
  .then(result => {
    console.log(`Retrieved ip ${result.value} for service ${data.serviceName}`);
  })
  .catch(err => console.log(err));
}





