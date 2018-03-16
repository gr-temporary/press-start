
const electron = require('electron');
const Vue = require('vue/dist/vue.js');
const bus = require('./vue-bus.js');

const ipcRenderer = electron.ipcRenderer;

const playerStatus = require('./player-status.js');
const romList = require('./rom-list.js');
const gameScreen = require('./game-screen.js');

function getIP() {
	const os = require('os');
	const ifaces = os.networkInterfaces();
	let ip = null;

	Object.keys(ifaces).forEach(function (ifname) {
		let alias = 0;

		ifaces[ifname].forEach(function (iface) {
			if ('IPv4' !== iface.family || iface.internal !== false) {
				// skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
				return;
			}

			if(!ifname.match(/VirtualBox/i)) {
				ip = iface.address;
			}

			if (alias >= 1) {
				// this single interface has multiple ipv4 addresses
				console.log(ifname + ':' + alias, iface.address);
			} else {
				// this interface has only one ipv4 adress
				console.log(ifname, iface.address);
			}
			++alias;
		});
	});
	return ip;
}

let app = new Vue({
	el: 'main',
	data: {
		address: null,
	
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

		this.address = getIP();
	}
});