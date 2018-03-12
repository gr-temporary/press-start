
const electron = require('electron');
const Vue = require('vue/dist/vue.js');

const ipcRenderer = electron.ipcRenderer;

console.log(electron);

let app = new Vue({
  el: 'main',
  data: {
    address: '',
    players: [{
    	id: null,
    	type: null,
    	buttons: {
			up: false,
			down: false,
			left: false,
			right: false,
			a: false,
			b: false,
			select: false,
			start: false
		}
    }, {
    	id: null,
    	type: null,
    	buttons: {
			up: false,
			down: false,
			left: false,
			right: false,
			a: false,
			b: false,
			select: false,
			start: false
		}
    }]
  },
  methods: {
  	updateAddress: function(newAddress) {
  		this.address = newAddress;
  	},
  	updatePlayers: function(newPlayers) {
  		this.players[0].id = null;
  		this.players[1].id = null;
  		newPlayers.forEach((x, i) => {
  			this.players[i].id = x.id;
  			this.players[i].type = x.type;
  		});
  	},
  	updateKeys: function(data) {
  		let player = this.players.find(x => x.id == data.id);
  		if(player) {
  			for(let i in data.keys) {
  				player.buttons[i] = data.keys[i];
  			}
  		}
  		if(player.buttons.up) {
  			console.log("UP");
  		}
  	}
  },
  mounted: function() {
  	ipcRenderer.send("ready");

  	ipcRenderer.on("ip-address", (event, address) => this.updateAddress(address));

  	ipcRenderer.on("player-data", (event, data) => this.updatePlayers(data.players));

  	ipcRenderer.on("player-keys", (event, data) => this.updateKeys(data));
  }
});