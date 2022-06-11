'use strict';

class IpHermes {
  constructor() {

    // TODO insert check for node version for the fetch function

    this.CONFIG = require('./config');
    this.http = require('http');

    this.services = {};

    this.monitoringTimerId;
    this.transmittingTimerId;
  }

  /**
   * Starts trasmitting the public ip of the machine
   * to the GAS url provided in CONFIG at regular intervals
   * 
   * @param {integer} interval - The interval in ms for IP broadcast to the GAS script
   */
  startTrasmitting(interval = this.CONFIG.broadcastInterval) {
    // To avoid spam detection problems with GAS, the interval is hardcoded not to be smaller than 1 minute.
    if(interval < 60000) {
      console.log('Interval too small, forcing 60 seconds');
      interval = 60000
    }
    console.log(`Starting trasmitting ip every ${interval} ms...`)
    this.transmittingTimerId = setInterval(sendIpToGAS, interval);
    sendIpToGAS();
  }

  /**
   * Stops trasmitting the ip to the GAS API
   */
  stopTransmitting() {
    clearInterval(this.timerId);
    console.log('Ip transmission stopped.');
  }



  startMonitoring() {
    
    // TODO implement this. There should be a single setinterval. At every interval every service is checked and ip updated
  }












  /**
   * Adds a new service to the list of ips to retrieve from the GAS API
   * @param {string} serviceName 
   */
  addService(serviceName) {
    this.services[serviceName] = undefined;
  }

  /**
   * Removes a service from the list of ips to retrieve from the GAS API
   * @param {string} serviceName 
   */
  removeService(serviceName) {
    if(this.services.hasOwnProperty(serviceName)) {
      delete this.services[serviceName];
    }
    else {
      console.log(`Service ${serviceName} was not being monitored. Nothing was removed.`);
    }
  }

  /**
   * Requests an ip to the Google API
   * @param {string} serviceName - The name of the service for which an IP is needed
   */
  requestIp(serviceName) {
    const data = {
      authCode: CONFIG.AUTH_CODE,
      requestType: 'REQUEST_IP',
      serviceName: serviceName
    }

    fetch(CONFIG.GASScriptUrl, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {'Content-type': 'application/json; charset=UTF-8'}
    })
    .then(response => {
      console.log('done');
      return response.json();
    })
    .then(result => {
      console.log(`Retrieved ip ${result.value} for service ${serviceName}`);
      this.services[serviceName] = result.value;
    })
    .catch(err => console.log(err));
  }







      
  sendIpToGAS() {
    console.log('Sending IP to GAS...');
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
  promisifiedIpRequest() {
    return new Promise((resolve, reject) => {
      http.get(CONFIG.PUBLIC_IP_SERVICE_PARAMETERS, (resp) => {
        resp.on('data', (ip) => {
          resolve(ip.toString());
        });
        resp.on('error', (err) => {
          reject(err);
        });
      })
    });
  }




  /**
   * Simple wrapper to allow for await
   */
  async getMyIp() {
    const ip = await promisifiedIpRequest();
    return ip;
  }
    
  /**
   * Sends an ip to the Google API
   * @param {string} ip - The IP to dispatch
   */
  dispatchIp(ip) {
    const data = {
      authCode: CONFIG.AUTH_CODE,
      requestType: 'UPDATE_IP',
      serviceName: CONFIG.SERVER_SERVICE_NAME,
      ip: ip
    }

    fetch(CONFIG.GAS_SCRIPT_URL, {
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
}









