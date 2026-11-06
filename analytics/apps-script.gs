/**
 * Recibe los eventos del Escáner de Vida y de COMPRENDE y los guarda en una
 * pestaña "eventos" de la hoja de cálculo donde se pega este script.
 *
 * Cómo instalarlo (5 minutos):
 * 1. Crea una hoja de Google Sheets nueva, por ejemplo "PESDAL · Eventos".
 * 2. Menú Extensiones → Apps Script. Borra lo que aparece y pega este archivo.
 * 3. Guarda. Luego: Implementar → Nueva implementación → tipo "Aplicación web".
 *    - Ejecutar como: Yo
 *    - Quién tiene acceso: Cualquier persona
 * 4. Autoriza los permisos y copia la URL que termina en /exec.
 * 5. Esa URL va en ANALYTICS_ENDPOINT de index.html y comprende.html.
 *
 * No se guardan nombres ni datos de contacto: solo el evento, la fecha,
 * identificadores aleatorios de sesión y las opciones elegidas.
 */
const SHEET_NAME = 'eventos';
const HEADERS = ['recibido', 'fecha_evento', 'herramienta', 'version', 'evento', 'sesion', 'escaner', 'area', 'modo', 'datos'];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(5000);
  try {
    const sheet = getSheet_();
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const version = String(body.version || '');
    sheet.appendRow([
      new Date(),
      body.t ? new Date(body.t) : '',
      version.indexOf('comprende') === 0 ? 'COMPRENDE' : 'Escáner',
      version,
      String(body.name || '').slice(0, 60),
      String(body.session || '').slice(0, 60),
      String(body.assessment || '').slice(0, 60),
      String(body.area || (body.data && body.data.area) || '').slice(0, 30),
      String(body.mode || (body.data && body.data.mode) || '').slice(0, 30),
      JSON.stringify(body.data || {}).slice(0, 2000)
    ]);
    return ContentService.createTextOutput('ok');
  } catch (err) {
    return ContentService.createTextOutput('error');
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return ContentService.createTextOutput('PESDAL eventos: activo');
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  }
  return sheet;
}
