'use strict';

/**
 * I prefer a .js over a .json because here I can provide better comments
 */

const CONFIG = {
  /** This is the url of the GAS script web app, AFTER it has been deployed. 
   *  Please check https://developers.google.com/apps-script/guides/web#deploy_a_script_as_a_web_app
  */
  GAS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbyjHDisryToeaYvACk5MtoLNbDL25Jr_RiJMuEgpCZ9pU0nF23oBYImZntCPFuSfm5e/exec',
  SERVER_SERVICE_NAME: 'LAPTOP', // the name of the machine running the beacon. This parameter is needed only when runninG as a server.
  AUTH_CODE: 'abcd', // this must be the same hardcoded into the server side GAS script
  broadcastInterval: 30000, //300000


  /**
   * Public ip API service. Default is ipify
   */
   PUBLIC_IP_SERVICE_PARAMETERS: {'host': 'api.ipify.org', 'port': 80, 'path': '/'}
}








module.exports = Object.freeze(CONFIG);