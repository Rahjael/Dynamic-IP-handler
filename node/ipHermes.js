'use strict';


class IpHermes {
  constructor() {
    // Here Nodejs version is checked. The script uses 'fetch()' which is not supported before version 18.
    const ver = Number(process.version.slice(1, 3));
    if(ver < 18) {
      throw Error('Node version must be 18 or higher. Please check the docs');
    }


    this.CONFIG = require('./config');
    this.http = require('http');

    this.services = this.CONFIG.SERVICES_TO_MONITOR.reduce( (obj, currentItem) => {
      obj[currentItem] = '';
      return obj;
    }, {});

    this.monitoringTimerId;
    this.transmittingTimerId;
  }




  /**
   * Starts trasmitting the public ip of the machine
   * to the GAS url provided in CONFIG at regular intervals
   * 
   * @param {integer} interval - The interval in ms for IP broadcast to the GAS script
   */
  startTrasmitting(interval = this.CONFIG.BROADCAST_INTERVAL) {
    // To avoid spam detection problems with GAS, the interval is hardcoded not to be smaller than 1 minute.
    if(interval < 60000) {
      console.log('Interval too small, forcing 60 seconds');
      interval = 60000;
    }
    console.log(`Starting trasmitting ip every ${interval} ms...`)
    this.transmittingTimerId = setInterval(this.sendIpToGAS.bind(this), interval);
    this.sendIpToGAS();
  }

  /**
   * Stops trasmitting the ip to the GAS API
   */
  stopTransmitting() {
    clearInterval(this.timerId);
    console.log('Ip transmission stopped.');
  }



  /**
   * Starts updating the ip for the registered services
   * polling the GAS url provided in CONFIG at regular intervals
   * 
   * @param {integer} interval - The interval in ms 
   */
  startMonitoring(interval = this.CONFIG.SERVICES_UPDATE_INTERVAL) {
    // To avoid spam detection problems with GAS, the interval is hardcoded not to be smaller than 1 minute.
    if(interval < 60000) {
      console.log('Interval too small, forcing 60 seconds');
      interval = 60000;
    }
    console.log(`Starting updating services every ${interval} ms...`)
    this.monitoringTimerId = setInterval(this.updateEveryService, interval);
    this.updateEveryService();
  }

  /**
   * Stops monitoring the services
   */
   stopTransmitting() {
    clearInterval(this.monitoringTimerId);
    console.log('Services monitoring stopped.');
  }

  updateEveryService() {
    // console.log('this inside updateEveryService(): ', this);
    for(const service in this.services) {
      this.requestIp(service);
    }
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
    console.log(`Requesting IP for service ${serviceName}`)
    const data = {
      authCode: this.CONFIG.AUTH_CODE,
      requestType: 'REQUEST_IP',
      serviceName: serviceName
    }


    fetch(this.CONFIG.GAS_SCRIPT_URL, {
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
      console.log(this.services);
    })
    .catch(err => console.log(err));
  }

      
  sendIpToGAS() {
    console.log('Sending IP to GAS...');
    this.getMyIp()
    .then( ip => this.dispatchIp(ip))
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
      this.http.get(this.CONFIG.PUBLIC_IP_SERVICE_PARAMETERS, (resp) => {
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
    const ip = await this.promisifiedIpRequest();
    return ip;
  }
    
  /**
   * Sends an ip to the Google API
   * @param {string} ip - The IP to dispatch
   */
  dispatchIp(ip) {
    const data = {
      authCode: this.CONFIG.AUTH_CODE,
      requestType: 'UPDATE_IP',
      serviceName: this.CONFIG.SERVER_SERVICE_NAME,
      ip: ip
    }

    fetch(this.CONFIG.GAS_SCRIPT_URL, {
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






module.exports.IpHermes = IpHermes;