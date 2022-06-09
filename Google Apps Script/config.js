/** @description Global config object */
const CONFIG = {
  SPREADSHEET_ID: '1MuTVRj_lKvDci7H6z8GDJk-QmYjCpxGdr2zwfk72qas',
  AUTHCODE: 'abcd',
  LOG_SHEET: SpreadsheetApp.getActiveSpreadsheet().getSheetByName('LOG'),
  CONFIG_SHEET: SpreadsheetApp.getActiveSpreadsheet().getSheetByName('CONFIG'),
  IP_HISTORY_SHEET: SpreadsheetApp.getActiveSpreadsheet().getSheetByName('IP_HISTORY'),
  MAX_LOGS: 100,
  MAX_IP_LOGS_FOR_EVERY_SERVICE: 10,
  SERVICE_NAME_COLUMN: 2,
  SERVICE_IP_COLUMN: 3
}