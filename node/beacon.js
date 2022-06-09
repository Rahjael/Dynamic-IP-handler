'use strict';

const CONFIG = require('./config');
const http = require('http');

/*
const testData = {
  authCode: "abcd",
  requestType: "UPDATE_IP",
  serviceName: "testService",
  currentIp: "151.156.26.784"
}
*/


//
// PROGRAM EXECUTION STARTS
//


setInterval(sendIpToGAS, CONFIG.broadcastInterval);
sendIpToGAS();

//
// PROGRAM EXECUTION ENDS
//





//
// FUNCTION DEFINITIONS FROM HERE ON
//


function sendIpToGAS() {
  console.log('sending IP to GAS...');
  getMyIp()
  .then( ip => dispatchIp(ip))
  .catch(err => console.log(err));
}







// ipify API is nice but we need it as a promise...

// http.get({'host': 'api.ipify.org', 'port': 80, 'path': '/'}, function(resp) {
//   resp.on('data', function(ip) {
//     console.log("My public IP address is: " + ip);
//   });
// });

// ... so here's a promisified version:
function promisifiedIpRequest() {
  return new Promise((resolve, reject) => {
    http.get({'host': 'api.ipify.org', 'port': 80, 'path': '/'}, function(resp) {
      resp.on('data', (ip) => {
        resolve(ip.toString());
      });
      resp.on('error', (err) => {
        reject(err);
      });
    })
  });
}


async function getMyIp() {
  const ip = await promisifiedIpRequest();
  return ip;
}


/**
 * Sends an ip to the Google API
 * @param {string} ip - The IP to dispatch
 */
function dispatchIp(ip) {
  const data = {
    authCode: CONFIG.authCode,
    requestType: 'UPDATE_IP',
    serviceName: CONFIG.serviceName,
    ip: ip
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
  .then(json => {
    console.log('request result: ', json);
  })
  .catch(err => console.log(err));
}






