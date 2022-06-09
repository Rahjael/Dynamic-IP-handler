'use strict';

/**
 * I prefer a .js over a .json because here I can provide better comments
 */

const CONFIG = {
  /** This is the url of the GAS script web app, AFTER it has been deployed. 
   *  Please check https://developers.google.com/apps-script/guides/web#deploy_a_script_as_a_web_app
  */
  fetchUrl: 'https://script.google.com/macros/s/AKfycbyjHDisryToeaYvACk5MtoLNbDL25Jr_RiJMuEgpCZ9pU0nF23oBYImZntCPFuSfm5e/exec',
  serviceName: 'LAPTOP', // the name of the machine running the beacon
  authCode: 'abcd', // this must be the same hardcoded into the server side GAS script
  broadcastInterval: 30000 //300000
}








module.exports = Object.freeze(CONFIG);