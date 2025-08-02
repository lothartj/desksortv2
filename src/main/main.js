const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const isDev = !app.isPackaged;
const Database = require('better-sqlite3');
const fs = require('fs-extra');
const FileSorter = require('./sorter');

const dbPath = path.join(app.getPath('userData'), 'database.sqlite');
let db;
let fileSorter;

async function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../preload.js'),
    },
  });

  if (isDev) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    await mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'));
  }

  return mainWindow;
}

function initializeDatabase() {
  if (!fs.existsSync(path.dirname(dbPath))) {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  }
  
  db = new Database(dbPath);
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS sorting_rules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      extensions TEXT NOT NULL,
      destination TEXT NOT NULL,
      enabled BOOLEAN DEFAULT 1
    );
    
    CREATE TABLE IF NOT EXISTS sort_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      source_path TEXT NOT NULL,
      destination_path TEXT NOT NULL,
      rule_id INTEGER,
      success BOOLEAN,
      error_message TEXT,
      FOREIGN KEY(rule_id) REFERENCES sorting_rules(id)
    );
  `);

  fileSorter = new FileSorter(db);
}

app.whenReady().then(async () => {
  initializeDatabase();
  const mainWindow = await createWindow();
  
  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.handle('get-desktop-path', () => {
  return app.getPath('desktop');
});

ipcMain.handle('scan-desktop', async () => {
  return fileSorter.scanDesktop();
});

ipcMain.handle('sort-files', async (event, rules) => {
  return fileSorter.sortFiles(rules);
});

ipcMain.handle('get-rules', () => {
  const rules = db.prepare('SELECT * FROM sorting_rules').all();
  return rules;
});

ipcMain.handle('save-rule', (event, rule) => {
  const stmt = db.prepare(`
    INSERT INTO sorting_rules (category, extensions, destination, enabled)
    VALUES (@category, @extensions, @destination, @enabled)
  `);
  return stmt.run(rule);
});

ipcMain.handle('update-rule', (event, rule) => {
  const stmt = db.prepare(`
    UPDATE sorting_rules 
    SET category = @category, 
        extensions = @extensions, 
        destination = @destination, 
        enabled = @enabled
    WHERE id = @id
  `);
  return stmt.run(rule);
});

ipcMain.handle('delete-rule', (event, ruleId) => {
  const stmt = db.prepare('DELETE FROM sorting_rules WHERE id = ?');
  return stmt.run(ruleId);
});

ipcMain.handle('get-sort-history', () => {
  const history = db.prepare(`
    SELECT 
      h.*,
      r.category,
      r.extensions
    FROM sort_history h
    LEFT JOIN sorting_rules r ON h.rule_id = r.id
    ORDER BY h.timestamp DESC
    LIMIT 100
  `).all();
  return history;
});

ipcMain.handle('select-directory', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory'],
  });
  
  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
}); 