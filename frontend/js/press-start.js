
const electron = require('electron');
const Vue = require('vue/dist/vue.js');

const ipcRenderer = electron.ipcRenderer;

function createPlayer() {
	return {
			id: null,
			type: 'unknown',
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
		};
}

let app = new Vue({
  el: 'main',
  data: {
    address: '',
	players: [createPlayer(), createPlayer()],
	defaultPlayer: createPlayer()
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
	},
	updateType: function(data) {
		let player = this.players.find(x => x.id == data.id);
		if(player) {
			player.type = data.type;
		}
	},
	realKeyDown: function(event) {
		switch(event.which) {
			case 37: this.defaultPlayer.buttons.left = true; break;
			case 38: this.defaultPlayer.buttons.up = true; break;
			case 39: this.defaultPlayer.buttons.right = true; break;
			case 40: this.defaultPlayer.buttons.down = true; break;
			case 90: this.defaultPlayer.buttons.a = true; break; // z
			case 88: this.defaultPlayer.buttons.b = true; break; // x
			case 32: this.defaultPlayer.buttons.select = true; break; // space
			case 13: this.defaultPlayer.buttons.start = true; break; // enter
		}
	},
	realKeyUp: function(event) {
		switch(event.which) {
			case 37: this.defaultPlayer.buttons.left = false; break;
			case 38: this.defaultPlayer.buttons.up = false; break;
			case 39: this.defaultPlayer.buttons.right = false; break;
			case 40: this.defaultPlayer.buttons.down = false; break;
			case 90: this.defaultPlayer.buttons.a = false; break; // z
			case 88: this.defaultPlayer.buttons.b = false; break; // x
			case 32: this.defaultPlayer.buttons.select = false; break; // space
			case 13: this.defaultPlayer.buttons.start = false; break; // enter
		}
	}
  },
  mounted: function() {
  	ipcRenderer.send("ready");

  	ipcRenderer.on("ip-address", (event, address) => this.updateAddress(address));

  	ipcRenderer.on("player-data", (event, data) => this.updatePlayers(data.players));

	ipcRenderer.on("player-keys", (event, data) => this.updateKeys(data));

	ipcRenderer.on("player-type", (event, data) => this.updateType(data));
	  
	document.addEventListener('keydown', (event) => this.realKeyDown(event));
	document.addEventListener('keyup', (event) => this.realKeyUp(event));
  }
});