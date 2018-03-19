
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
				start: false,
				pause: false
			}
		};
}

// global, because working with objects through proxies is pain
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
			this.players[0].id = null;
			this.players[1].id = null;
			newPlayers.forEach((x, i) => {
				players[i].id = x.id;
				players[i].type = x.type;

				this.players[i].type = x.type;
				this.players[i].connected = x.id != null;
			});
			players.forEach((x) => {
				for(let k in x.keys) {
					x.keys[k] = false;
				}
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
				case 27: defaultPlayer.keys.pause = true; break; // escape
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
				case 27: defaultPlayer.keys.pause = false; break; // escape
			}
			this.updateJoysticks();
		},
		updateJoysticks: function() {
			let prev, next;
			function update(idx, defaultPlayer) {
				for(let key in players[idx].keys) {
					prev = joysticks[idx][key];
					next = players[idx].keys[key] || defaultPlayer.keys[key];
					joysticks[idx][key] = next; 
					if(idx == 0 && prev != next && next) {
						bus.emit('keypress', key);
					} 
				}
			}
			update(0, defaultPlayer);
			update(1, nullPlayer);
		},
		flushJoysticks: function() {
			function update(idx, defaultPlayer) {
				for(let key in players[idx].keys) {
					joysticks[idx][key] = players[idx].keys[key] || defaultPlayer.keys[key];
				}
			}
			update(0, defaultPlayer);
			update(1, nullPlayer);
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
		bus.on("flush-keys", () => this.flushJoysticks());
		  
		document.addEventListener('keydown', (event) => this.realKeyDown(event));
		document.addEventListener('keyup', (event) => this.realKeyUp(event));
	}
};