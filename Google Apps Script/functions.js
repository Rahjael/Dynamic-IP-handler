/**
 * 
 *  This is a public API hosted in a Google Drive environment.
 * 
 *  It serves as a collector for home hosted servers under dynamic IPs,
 *  providing a way to have mobile apps and web services being able to access those
 *  servers without having to rely on third party services like DynDNS and the like.
 * 
 */











 function test() {
  const testContentsUPDATE_IP = {
    authCode: 'abcd',
    serviceName: 'blablabla',
    currentIp: '151.26.154.189'
  };

  const testEvent = {
    postData: {
      contents: JSON.stringify(testContentsUPDATE_IP)
    }
  };

  Logger.log(testEvent)

  doPost(testEvent);
}




/**
 * We're working mainly with this function
 */
function doPost(e) {
  /**
   * How the event object is structured https://developers.google.com/apps-script/guides/web
   * 
   * After many trials and errors I think the important points to take home are the following:
   * 
   * 1. 'e' is an object provided by the server when doPost() is triggered. It is a JS object.
   * 
   * 2. The problem arises with the 'contents' property (e.postData.contents), which is sent by the client
   * during the POST request and is actually received as a JSON string, so it must be JSON.parse()'d.
   * 
   * So, in a nutshell:
   * - treat 'e' the JS object which it is.
   * - parse 'e.postData.contents' before trying to access the data it contains.
   */

  // We log the request and parse the contents
  logThisObject('POST received:', e);
  const contents = JSON.parse(e.postData.contents);

  /*contents = {
    authCode: CONFIG.authCode,
    requestType: "UPDATE_IP",
    serviceName: CONFIG.serviceName,
    ip: ip
  } */
  logThisObject('CONTENTS', contents);

  // This is just a rudimentary security filter
  const authCode = contents.authCode;
  if(authCode != CONFIG.AUTHCODE) {
    const package = JSON.stringify({
      status: 401,
      message: 'INVALID AUTHCODE'
    });
    logThisObject('RESPONSE', package);
    return ContentService.createTextOutput(package);
  }
  logThisNotice('AUTHORIZATION GRANTED', 'granted');
  

  // Evaluate requestType and act accordingly
  const requestType = contents.requestType;
  logThisNotice('REQUEST RECEIVED', requestType);

  // Apparently cases in a switch statement don't allow for multiple 'const' of same name,
  // so I will just 'let' the package here and populate it later on.
  let package = {};
  switch(requestType) {
    case 'UPDATE_IP':
      updateIp(contents.serviceName, contents.ip);
      cleanupService(contents.serviceName);

      // Send back a response
      package = {
        status: 200,
        message: `Logged new ip for service ${contents.serviceName}: ${contents.ip}`,
        value: 'OK'
      };
      logThisObject('RESPONSE', package);
      return ContentService.createTextOutput(JSON.stringify(package));

      break; // Because you never know


    case 'REQUEST_IP':
      const lastIp = retrieveLastIp(contents.serviceName);

      logThisNotice('DEBUG', `lastIp ${lastIp}`);

      // Send back a response
      package = {
        status: 200,
        message: `Last known ip for service ${contents.serviceName}: ${lastIp}`,
        value: lastIp
      };
      logThisObject('RESPONSE', package);
      return ContentService.createTextOutput(JSON.stringify(package));

      break; // Because you never know

    default:
      logThisNotice('ERROR', `could not understand request: ${requestType}`);
  }

  cleanupLogsSheet();
}




/**
 * Deletes old logs when they are more than CONFIG.MAX_LOGS
 */
function cleanupLogsSheet() {
  const lastRow = CONFIG.LOG_SHEET.getLastRow();
  if(lastRow > CONFIG.MAX_LOGS) {
    CONFIG.LOG_SHEET.deleteRows(1, lastRow - CONFIG.MAX_LOGS);
  }
}

/**
 * Traverses the table from the bottom up and finds the last known ip 
 * for the requested service.
 * 
 *  @param {string} serviceName - The name of the service
 */
function retrieveLastIp(serviceName) {
  // 1. Get the entire table as 2d array - this is faster than checking every row with single calls
  // 2. Filter the result to only the rows with the serviceName we want
  // 3. Since .filter() preserves order, the record we want is the last item of the filtered array, so we can just .pop() it
  const ip = CONFIG.IP_HISTORY_SHEET.getRange(1, 1, CONFIG.IP_HISTORY_SHEET.getLastRow(), CONFIG.IP_HISTORY_SHEET.getLastColumn()).getValues()
  .filter(row => row[CONFIG.SERVICE_NAME_COLUMN - 1] === serviceName).pop()[CONFIG.SERVICE_IP_COLUMN - 1];

  //logThisNotice('DEBUG', `found ip ${ip}`);

  return ip;
}

/**
 * Traverses the table from the bottom up and counts the updates for that service.
 * After max updates is reached, everything older is deleted.
 * 
 * @param {string} serviceName - The name of the service for which to cleanup
 */
function cleanupService(serviceName) {
  // TODO The number of calls here could be optimized, but we will do it later on in the development

  logThisNotice('CLEANUP', `started for service ${serviceName}`);


  // Start from the last row
  let currentRow = CONFIG.IP_HISTORY_SHEET.getLastRow();
  let counted = 0;
  let deleted = 0;

  // Go upwards counting every log for this 'serviceName'
  while(currentRow > 0) {
    if(CONFIG.IP_HISTORY_SHEET.getRange(currentRow, CONFIG.SERVICE_NAME_COLUMN).getValue() === serviceName) {
      counted++;
      if(counted > CONFIG.MAX_IP_LOGS_FOR_EVERY_SERVICE) {
        CONFIG.IP_HISTORY_SHEET.deleteRow(currentRow);
        deleted++;
      }
    }
    currentRow--;
  }

  logThisNotice('CLEANUP', `Counted ${counted} rows for service ${serviceName}. ${deleted} deleted.`);
}


/**
 * Logs a new ip for serviceName
 * @param {string} serviceName - The service
 * @param {string} ip - The new ip to log
 */
function updateIp(serviceName, ip) {
  const newRow = [Date.now(), serviceName, ip]
  //CONFIG.IP_HISTORY_SHEET.insertRowBefore(1).getRange(1, 1, 1, 2).setValues([[serviceName, ip]]);
  CONFIG.IP_HISTORY_SHEET.appendRow(newRow);
  logThisNotice('IP UPDATE', `new ip ${ip} logged for service ${serviceName}`);
}


/**
 * We're not using this at this time, but GAS requires
 * doGet(e) to be there for deploying the script as webapp
 */
function doGet(e) {
  logThisObject('GET received:', e);
}



/**
 * Logs an entire object (for debugging purposes)
 * Structure is [Date in ms, Date readable, objectName, objStringified]
 * @param {string} objectName - The name of the object to log.
 * @param {object} obj - The object or property to log.
 */
function logThisObject(objectName, obj) {
  CONFIG.LOG_SHEET.appendRow([Date.now(), Date().toString(), objectName, JSON.stringify(obj)]);
}

/** Appends a new row to the LOG sheet as a [Date in ms, Date readable, eventName, message]
 * @param {string} eventName - The name of the event to log.
 * @param {string} string - The message to log
 */
function logThisNotice(eventName, message) {
  CONFIG.LOG_SHEET.appendRow([Date.now(), Date().toString(), eventName, message]);
}





