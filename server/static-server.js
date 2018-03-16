
const express = require('express');
const app = express();
const http = require('http').Server(app);

const path = require('path');

app.use(express.static(path.join(__dirname, '..', 'frontend', 'controller')));

process.on('SIGTERM', shutDown);
process.on('SIGINT', shutDown);

function shutDown() {
    console.log('Received kill signal, shutting down gracefully');
    http.close(() => {
        console.log('Closed out remaining connections');
        process.exit(0);
    });

    setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 5000);
}

module.exports = {
	run: function () {
		http.listen(3003, () => console.log('Press-start server is running!'));
	},
	get: function() {
		return http;
    },
    stop: shutDown
};