const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  getPillars: () => ipcRenderer.invoke('getPillars'),
  addPillar: (name) => ipcRenderer.invoke('addPillar', name),
  removePillar: (id) => ipcRenderer.invoke('removePillar', id),
  getFunctionCapabilities: () => ipcRenderer.invoke('getFunctionCapabilities'),
  addFunctionCapability: (name, type, pillarId) => ipcRenderer.invoke('addFunctionCapability', name, type, pillarId),
  removeFunctionCapability: (id) => ipcRenderer.invoke('removeFunctionCapability', id),
  getMaturityStages: () => ipcRenderer.invoke('getMaturityStages'),
  getTechnologiesProcesses: (functionCapabilityId) => ipcRenderer.invoke('getTechnologiesProcesses', functionCapabilityId),
  addTechnologyProcess: (description, type, functionCapabilityId, maturityStageId) => ipcRenderer.invoke('addTechnologyProcess', description, type, functionCapabilityId, maturityStageId),
  removeTechnologyProcess: (id) => ipcRenderer.invoke('removeTechnologyProcess', id),
  saveAssessment: (techProcessId, status, notes) => ipcRenderer.invoke('saveAssessment', techProcessId, status, notes),
  getAssessmentResponses: () => ipcRenderer.invoke('getAssessmentResponses'),
  savePillarOrder: (order) => ipcRenderer.invoke('savePillarOrder', order),
  saveFunctionOrder: (order) => ipcRenderer.invoke('saveFunctionOrder', order),
  editPillar: (id, name) => ipcRenderer.invoke('editPillar', id, name),
  editFunctionCapability: (id, name, type, pillarId) => ipcRenderer.invoke('editFunctionCapability', id, name, type, pillarId),
  editTechnologyProcess: (id, description, type, functionCapabilityId, maturityStageId) => ipcRenderer.invoke('editTechnologyProcess', id, description, type, functionCapabilityId, maturityStageId)
});
