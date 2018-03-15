
const electron = require('electron');
const Vue = require('vue/dist/vue.js');
const bus = require('./vue-bus.js');

const ipcRenderer = electron.ipcRenderer;

const playerStatus = require('./player-status.js');
const romList = require('./rom-list.js');
const gameScreen = require('./game-screen.js');

let app = new Vue({
  el: 'main',
  data: {
    address: '',
	
  },
  components: {
  	'player-status': playerStatus,
  	'rom-list': romList,
  	'game-screen': gameScreen
  },
  methods: {
  	updateAddress: function(newAddress) {
  		this.address = newAddress;
  	},
  	
  },
  mounted: function() {
  	ipcRenderer.send("ready");

  	ipcRenderer.on("ip-address", (event, address) => this.updateAddress(address));
  }
});