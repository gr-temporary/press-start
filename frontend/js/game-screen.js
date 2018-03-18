const electron = require('electron');
const bus = require('./vue-bus.js');
const players = require('./player-status.js');
const jsnes = require('jsnes');
const fs = require('fs');

const ipcRenderer = electron.ipcRenderer;

class AudioPlayerNes {
	constructor() {
		this.audioContext = new window.AudioContext;
		this.channels = 2;
		this.frameCount = 1468;
		this.muted = false;
		this.arrayBuffer = []; 	// Stored left channel on even and right channel on odd indexes
	}
	playSample() {
		let audioBuffer = this.audioContext.createBuffer(this.channels, this.frameCount, this.audioContext.sampleRate);

		let leftChannel = audioBuffer.getChannelData(0);
		let rightChannel = audioBuffer.getChannelData(1);
		for (var i = 0, len = Math.min(this.frameCount, this.arrayBuffer.length); i < len; i++) {
			(i%2 === 0) ? leftChannel[i/2] = this.arrayBuffer[i] : rightChannel[(i - 1)/2] = this.arrayBuffer[i];
	    }
		this.arrayBuffer = [];

		let source = this.audioContext.createBufferSource();

		source.buffer = audioBuffer;
		source.connect(this.audioContext.destination);
		!this.muted && source.start();
	}
	push(left, right) {
		if(this.arrayBuffer.length >= this.frameCount) {
			this.playSample();
		}
		this.arrayBuffer.push(left);
		this.arrayBuffer.push(right);
	}
}

let audioPlayer = new AudioPlayerNes();
let canvas, context;

let nes = new jsnes.NES({
	onFrame: function(frameBuffer) {
		updateButtons();
		let imgData = context.getImageData(0, 0, 256, 240);
		let data = imgData.data;
		for(let i=0; i<frameBuffer.length; i++) {
			let k = i * 4;
			let r = frameBuffer[i] & 0xff;
			let g = (frameBuffer[i] >> 8) & 0xff;
			let b = (frameBuffer[i] >> 16) & 0xff;
			data[k] = r;
			data[k + 1] = g;
			data[k + 2] = b;
			data[k + 3] = 255;
		}
		context.putImageData(imgData, 0, 0);
	},
	onAudioSample: function(left, right) {
		audioPlayer.push(left, right);
	}
});

const buttonMap = {
	'up': 4,
	'right': 7,
	'down': 5,
	'left': 6,
	'a': 0,
	'b': 1,
	'start': 3,
	'select': 2
};

function updateButtons() {
	const joysticks = players.methods.getKeys();

	function setButton(player, button, state) {
		let b = buttonMap[button];
		player++;
		if(!button) return;
		//console.log(player, button, state, nes);
		if(state) {
			nes.buttonDown(player, b);
		} else {
			nes.buttonUp(player, b);
		}
	}
	
	for(let i=0; i<joysticks.length; i++) {
		for(let k in joysticks[i]) {
			setButton(i, k, joysticks[i][k]);
		}
	}
}

module.exports = {
	template: '#game-screen',
	data: function() {
		return {
			active: false,
			paused: false
		};
	},
	methods: {
		playRom: function(rom) {
			console.log("Loading ROM " + rom.name);
			let data = fs.readFileSync('frontend/roms/' + rom.rom, {encoding: 'binary'});
			nes.loadROM(data);
			this.active = true;
			this.start();
		},
		frame: function() {
			nes.frame();
			if(!this.paused && this.active) {
				requestAnimationFrame(() => this.frame());
			}
		},
		start: function() {
			this.paused = false;
			this.frame();
		},
		pause: function() {
			this.paused = true;
		},
		onKeyPress: function(key) {
			console.log(key);
			if(this.active && key == 'pause') {
				this.pause();
			}
		}
	},
	mounted: function() {
		canvas = this.$refs.canvas;
		context = canvas.getContext('2d');
		bus.on('play-rom', (rom) => this.playRom(rom));
		bus.on('keypress', (key) => this.onKeyPress(key));
	}
};