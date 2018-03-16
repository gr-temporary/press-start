const electron = require('electron');
const bus = require('./vue-bus.js');

const ipcRenderer = electron.ipcRenderer;

module.exports = {
	template: '#game-screen',
	data: function() {
		return {};
	}
};