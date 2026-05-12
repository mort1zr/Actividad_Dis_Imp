const SHEET_NAME = 'Reportes';

function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    // Crear encabezados
    sheet.appendRow([
      'id', 'lat', 'lng', 'type', 'street', 
      'district', 'description', 'photo', 'date', 
      'status', 'reportedBy'
    ]);
    // Formato básico para encabezados
    sheet.getRange('A1:K1').setFontWeight('bold').setBackground('#f3f4f6');
    sheet.setFrozenRows(1);
  }
}

function doGet(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    return ContentService.createTextOutput(JSON.stringify({ error: 'La hoja no existe. Ejecuta setup() primero.' }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    return ContentService.createTextOutput(JSON.stringify([]))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  const headers = data.shift();
  const reports = data.map(row => {
    let report = {};
    headers.forEach((header, index) => {
      report[header] = row[index];
    });
    return report;
  });
  
  return ContentService.createTextOutput(JSON.stringify(reports))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);
    
    // Al usar text/plain en React, los datos llegan en e.postData.contents
    const data = JSON.parse(e.postData.contents);
    
    if (data.action === 'add') {
      const { report } = data;
      sheet.appendRow([
        report.id, report.lat, report.lng, report.type, report.street, 
        report.district, report.description, report.photo || '', report.date, 
        report.status, report.reportedBy
      ]);
      return ContentService.createTextOutput(JSON.stringify({ success: true }))
        .setMimeType(ContentService.MimeType.JSON);
        
    } else if (data.action === 'updateStatus') {
      const { id, status } = data;
      const values = sheet.getDataRange().getValues();
      const headers = values[0];
      const idIndex = headers.indexOf('id');
      const statusIndex = headers.indexOf('status');
      
      for (let i = 1; i < values.length; i++) {
        if (values[i][idIndex] == id) {
          sheet.getRange(i + 1, statusIndex + 1).setValue(status);
          break;
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ success: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ error: 'Acción no reconocida' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
