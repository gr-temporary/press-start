
const electron = require('electron');
const Vue = require('vue/dist/vue.js');
const bus = require('./vue-bus.js');

const ipcRenderer = electron.ipcRenderer;

const playerStatus = require('./player-status.js');
const romList = require('./rom-list.js');
const gameScreen = require('./game-screen.js');
const helloScreen = require('./hello-screen.js');

Vue.component('hello-screen', helloScreen);

let app = new Vue({
	el: 'main',
	data: {

	},
	components: {
		'player-status': playerStatus,
		'rom-list': romList,
		'game-screen': gameScreen
	},
	methods: {

	},
	mounted: function() {
		ipcRenderer.send("ready");
	}
});