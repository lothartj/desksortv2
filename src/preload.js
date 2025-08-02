const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  getDesktopPath: () => ipcRenderer.invoke('get-desktop-path'),
  scanDesktop: () => ipcRenderer.invoke('scan-desktop'),
  sortFiles: (rules) => ipcRenderer.invoke('sort-files', rules),
  
  getRules: () => ipcRenderer.invoke('get-rules'),
  saveRule: (rule) => ipcRenderer.invoke('save-rule', rule),
  updateRule: (rule) => ipcRenderer.invoke('update-rule', rule),
  deleteRule: (ruleId) => ipcRenderer.invoke('delete-rule', ruleId),
  
  getSortHistory: () => ipcRenderer.invoke('get-sort-history'),
  
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
}); 