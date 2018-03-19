
const bus = require('./vue-bus.js');
const qrcode = require('qrcode');

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

			if(!ifname.match(/VirtualBox/i) && iface.address.match(/^192\.168\./)) {
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

module.exports = {
	template: '#hello-screen',
	data: function() {
		return {
			address: null
		}
	},
	methods: {
		updateAddress: function() {
			this.address = getIP();
			if(this.address) {
				qrcode.toCanvas(this.$refs.canvas, "http://" + this.address + ":3003", (error) => {
					console.log(error);
					this.$refs.canvas.style.width = "200px";
					this.$refs.canvas.style.height = "200px";
				});
			}
		}
	},
	mounted: function() {
		this.updateAddress();
	}
}