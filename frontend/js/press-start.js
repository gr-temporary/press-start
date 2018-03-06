
const electron = require('electron');
const Vue = require('vue/dist/vue.js');

const ipcRenderer = electron.ipcRenderer;

console.log(electron);

let app = new Vue({
  el: 'main',
  data: {
    address: ''
  },
  methods: {
  	updateAddress: function(newAddress) {
  		this.address = newAddress;
  	}
  },
  mounted: function() {
  	ipcRenderer.send("ready");

  	ipcRenderer.on("ip-address", (event, address) => this.updateAddress(address));
  }
});