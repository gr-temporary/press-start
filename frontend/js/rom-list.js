const electron = require('electron');
const bus = require('./vue-bus.js');

const ipcRenderer = electron.ipcRenderer;

module.exports = {
	template: '#rom-list',
	data: function() {
		return {
			roms: [],
			activeIndex: -1,
			active: true
		};
	},
	methods: {
		getPreview: function(rom) {
			return 'img/' + rom.preview;
		},
		setRoms: function(list) {
			list.forEach((x, i) => {
				x.index = i + 1;
				this.roms.push(x);
			});
			/*if(this.roms.length) {
				this.activeIndex = 0;
			}*/
		},
		onKeypress: function(key) {
			if(!this.active) {
				return;
			}
			if(key == 'left') {
				this.next(-1);
			}
			if(key == 'right') {
				this.next(1);
			}
			if(key == 'start' && this.activeIndex > -1) {
				console.log("Starting ROM " + this.roms[this.activeIndex].name);
				this.deactivate();
				bus.emit('play-rom', this.roms[this.activeIndex]);
			}
		},
		next: function(dir) {
			if(this.roms.length == 0) {
				return;
			}
			let idx = this.activeIndex + dir;
			if(idx < 0) idx = this.roms.length - 1;
			if(idx >= this.roms.length) idx = 0;
			this.activeIndex = idx;
			this.$refs.list.style.transform = "translateX(" + (-100 * (this.activeIndex + 1)) + "vw)";

			if(dir > 0) {
				this.pushButton(this.$refs.right);
			} else {
				this.pushButton(this.$refs.left);
			}
		},
		pushButton: function(button) {
			button.classList.remove('push');
			button.offsetWidth = button.offsetWidth;
			button.classList.add('push');
		},
		deactivate: function() {
			this.active = false;
		}
	},
	mounted: function() {
		ipcRenderer.send("get-roms");

		ipcRenderer.on("rom-list", (event, data) => this.setRoms(data));

		bus.on('keypress', (key) => this.onKeypress(key));
	}
};