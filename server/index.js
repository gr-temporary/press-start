const fs = require('fs');
const electron = require('electron');
var express = require('express');
var expressServer = express();
var server = require('http').Server(expressServer);
var io = require('socket.io')(server);
const ip = require('ip');

const app = electron.app;
    // Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

const ipc = electron.ipcMain;
let mainWindow;

expressServer.use('/', express.static('controller'));

server.listen(8000);

var players = [];

io.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });

  socket.on('device', function(data) {
      if(players.length < 2) {
          players.push(socket);
      }
  });

  socket.on('disconnect', function() {
      for(var i=0; i<players.length; i++) {
          if(players[i].id == socket.id) {
              players.splice(i, 1);
              break;
          }
      }
  });

  socket.on('keys', function(data) {
      var s = "";
      for(var i in data.keys) {
          if(data.keys[i])
            s += i + " ";
      }
      console.log(s);
  });
});

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600
    });

    // and load the index.html of the app.
    mainWindow.loadURL(`file://${__dirname}/frontend/index.html`);

    // Open the DevTools.
    //mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    mainWindow.on('closed', function() {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function() {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function() {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});