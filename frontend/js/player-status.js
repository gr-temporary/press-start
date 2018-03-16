
const electron = require('electron');
const bus = require('./vue-bus.js');

const ipcRenderer = electron.ipcRenderer;

function createPlayer() {
	return {
			id: null,
			type: 'unknown',
			keys: {
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

// gloabal, because working with objects through proxies is pain
let players = [createPlayer(), createPlayer()],
	defaultPlayer = createPlayer(),
	nullPlayer = createPlayer(),
	joysticks = [createPlayer().keys, createPlayer().keys];

module.exports = {
	template: '#player-status',
	data: function() {
		return {
			players: [{
				type: 'unknown',
				connected: false
			}, {
				type: 'unknown',
				connected: false
			}]
		};
	},
	methods: {
		updatePlayers: function(newPlayers) {
			players[0].id = null;
			players[1].id = null;
			newPlayers.forEach((x, i) => {
				players[i].id = x.id;
				players[i].type = x.type;

				this.players[i].type = x.type;
				this.players[i].connected = x.id != null;
			});
		},
		updateKeys: function(data) {
			let player = players.findIndex(x => x.id == data.player);
			if(player > -1) {
				for(let i in data.keys) {
					players[player].keys[i] = data.keys[i];
				}
			}
			this.updateJoysticks();
		},
		updateType: function(data) {
			let player = players.findIndex(x => x.id == data.player);
			if(player > -1) {
				players[player].type = data.type;
				this.players[player].type = data.type;
			}
		},
		realKeyDown: function(event) {
			switch(event.which) {
				case 37: defaultPlayer.keys.left = true; break;
				case 38: defaultPlayer.keys.up = true; break;
				case 39: defaultPlayer.keys.right = true; break;
				case 40: defaultPlayer.keys.down = true; break;
				case 90: defaultPlayer.keys.a = true; break; // z
				case 88: defaultPlayer.keys.b = true; break; // x
				case 32: defaultPlayer.keys.select = true; break; // space
				case 13: defaultPlayer.keys.start = true; break; // enter
			}
			this.updateJoysticks();
		},
		realKeyUp: function(event) {
			switch(event.which) {
				case 37: defaultPlayer.keys.left = false; break;
				case 38: defaultPlayer.keys.up = false; break;
				case 39: defaultPlayer.keys.right = false; break;
				case 40: defaultPlayer.keys.down = false; break;
				case 90: defaultPlayer.keys.a = false; break; // z
				case 88: defaultPlayer.keys.b = false; break; // x
				case 32: defaultPlayer.keys.select = false; break; // space
				case 13: defaultPlayer.keys.start = false; break; // enter
			}
			this.updateJoysticks();
		},
		updateJoysticks: function() {
			let prev, next;
			if(players[0].id) {
				for(let i in players[0].keys) {
					prev = joysticks[0][i];
					next = players[0].keys[i] || defaultPlayer.keys[i];
					joysticks[0][i] = next;
					if(prev != next && next) {
						bus.emit('keypress', i);
					} 
				}
			} else {
				for(let i in players[0].keys) {
					prev = joysticks[0][i];
					next = defaultPlayer.keys[i];
					joysticks[0][i] = next;
					if(prev != next && next) {
						bus.emit('keypress', i);
					} 
				}
			}
			if(players[1].id) {
				for(let i in players[1].keys) {
					joysticks[1][i] = players[1].keys[i];
				}
			} else {
				for(let i in players[1].keys) {
					joysticks[1][i] = nullPlayer.keys[i];
				}
			}
		},
		getKeys: function() {
			return joysticks;
		}
	},
	mounted: function() {
		ipcRenderer.on("player-data", (event, data) => this.updatePlayers(data.players));

		ipcRenderer.on("player-keys", (event, data) => this.updateKeys(data));

		ipcRenderer.on("player-type", (event, data) => this.updateType(data));

		bus.on("get-keys", () => bus.emit("joysticks", this.getKeys() ));
		  
		document.addEventListener('keydown', (event) => this.realKeyDown(event));
		document.addEventListener('keyup', (event) => this.realKeyUp(event));
	}
};