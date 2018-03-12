
const express = require('express');
const app = express();
const http = require('http').Server(app);

const path = require('path');

app.use(express.static(path.join(__dirname, '..', 'frontend', 'controller')));

module.exports = {
	run: function () {
		http.listen(3003, () => console.log('Press-start server is running!'));
	},
	get: function() {
		return http;
	}
};