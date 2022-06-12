'use strict';

/**
 * IMHO, a .js can provide better comments than a .json
 */
const CONFIG = {
  //
  //  GENERAL CONFIG
  // 

  /** This is the url of the GAS script web app, AFTER it has been deployed. 
   *  Please check https://developers.google.com/apps-script/guides/web#deploy_a_script_as_a_web_app
  */
  GAS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbyjHDisryToeaYvACk5MtoLNbDL25Jr_RiJMuEgpCZ9pU0nF23oBYImZntCPFuSfm5e/exec',
  AUTH_CODE: 'abcd', // this must be the same hardcoded into the server side GAS script  
  /////////////////////////////////////////////
  /////////////////////////////////////////////
  /////////////////////////////////////////////
  
  //
  //  SERVER CONFIG
  //
  
  //Public ip API service. Default is ipify
  PUBLIC_IP_SERVICE_PARAMETERS: {'host': 'api.ipify.org', 'port': 80, 'path': '/'},
  SERVER_SERVICE_NAME: 'TEST_SERVER', // the name of the machine running the beacon. This parameter is needed only when running as a server.
  BROADCAST_INTERVAL: 300000, // time in ms
  /////////////////////////////////////////////
  /////////////////////////////////////////////
  /////////////////////////////////////////////
  
  //
  //  CLIENT CONFIG
  //
  SERVICES_UPDATE_INTERVAL: 30000, // time in ms
  SERVICES_TO_MONITOR: ['TEST_SERVER', 'LAPTOP', 'NEW_TEST'] // Array of strings

}








module.exports = Object.freeze(CONFIG);