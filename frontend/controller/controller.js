
var info = document.querySelector(".info");

var dpad = document.querySelector(".d-pad");
var ab = document.querySelector(".a-b");
var startSelect = document.querySelector(".start-select");
var pause = document.querySelector(".pause");
var container = document.querySelector(".container");

var buttons = {
	a: false,
	b: false,
	up: false,
	right: false,
	down: false,
	left: false,
	start: false,
	select: false,
	pause: false
};

function detectOS() {
	// iOS, Android, Windows PC, Mac, Linux, Windows Phone
	var nav = navigator.userAgent;
	if(nav.match(/Windows/i)) {
		return "Windows";
	} else if(nav.match(/Macintosh/i)) {
		return "Mac";
	} else if(nav.match(/Android/i)) {
		return "Android";
	} else if(nav.match(/iPhone|iPad|iPod/i)) {
		return "iOS";
	}
	return "unknown";
}

function updateDpad(touches) {
	var rect = dpad.getBoundingClientRect();
	var pi4 = Math.PI / 4;
	buttons.right = false;
	buttons.up = false;
	buttons.down = false;
	buttons.left = false;
	for(var i=0; i<touches.length; i++) {
		var x = (touches[i].clientX - rect.left) / rect.width - 0.5;
		var y = (touches[i].clientY - rect.top) / rect.height - 0.5;
		var a = Math.atan2(y, x);
		if(Math.abs(x) > 1.2 || Math.abs(y) > 1.2) {
			continue;
		}
		if(Math.abs(a) < pi4) {
			buttons.right = true;
		}
		if(a < -pi4 && a > -3 * pi4) {
			buttons.up = true;
		}
		if(a > pi4 && a < 3 * pi4) {
			buttons.down = true;
		}
		if(a < -3 * pi4 || a > 3 * pi4) {
			buttons.left = true;
		}
	}
}

function updateAB(touches) {
	var rect = ab.getBoundingClientRect();
	buttons.a = false;
	buttons.b = false;
	for(var i=0; i<touches.length; i++) {
		var x = (touches[i].clientX - rect.left) / rect.width - 0.5;
		var y = (touches[i].clientY - rect.top) / rect.height - 0.5;
		if(Math.abs(x) > 1.2 || Math.abs(y) > 1.2) {
			continue;
		}
		if(x < 0) {
			buttons.a = true;
		}
		if(x > 0) {
			buttons.b = true;
		}
	}
}

function updateStartSelect(touches) {
	var rect = startSelect.getBoundingClientRect();
	buttons.start = false;
	buttons.select = false;
	for(var i=0; i<touches.length; i++) {
		var x = (touches[i].clientX - rect.left) / rect.width - 0.5;
		var y = (touches[i].clientY - rect.top) / rect.height - 0.5;
		if(Math.abs(x) > 1.2 || Math.abs(y) > 1.2) {
			continue;
		}
		if(x < 0) {
			buttons.start = true;
		}
		if(x > 0) {
			buttons.select = true;
		}
	}
}

function updatePause(touches) {
	var rect = pause.getBoundingClientRect();
	buttons.pause = false;
	for(var i=0; i<touches.length; i++) {
		var x = (touches[i].clientX - rect.left) / rect.width - 0.5;
		var y = (touches[i].clientY - rect.top) / rect.height - 0.5;
		if(x > -1 && x < 1 && y > -1 && y < 1) {
			buttons.pause = true;
		}
	}
}

function addTouchEvents(element, callback) {
	function listener(event) {
		callback(event.touches);
		socket.emit("keys", buttons);
		event.preventDefault();
		return false;
	}

	element.addEventListener("touchstart", listener);
	element.addEventListener("touchmove", listener);
	element.addEventListener("touchend", listener);
}

addTouchEvents(dpad, updateDpad);
addTouchEvents(ab, updateAB);
addTouchEvents(startSelect, updateStartSelect);
addTouchEvents(pause, updatePause);

function updatePrimary(primary) {
	if(primary === true) {
		container.classList.remove('secondary');
		container.classList.add('primary');
		startSelect.classList.remove('hidden');
	}
	if(primary === false) {
		container.classList.remove('primary');
		container.classList.add('secondary');
		startSelect.classList.add('hidden');
	}
	if(primary === null) {
		container.classList.remove('primary');
		container.classList.remove('secondary');
		startSelect.classList.add('hidden');
	}
}

function resize() {
	var width = window.innerWidth;
	var size = width / 70;
	if(size > 12) {
		size = 12;
	}
	info.innerHTML = width + "/" + size;
	document.documentElement.style.fontSize = size + 'px';
}

window.addEventListener("resize", resize);
resize();

var socket = io('/');
socket.on('connect', () => {
	container.classList.remove('disconnected');
	var os = detectOS();
	socket.emit("type", { os: os, ua: navigator.userAgent });
	socket.on("primary", updatePrimary);
	socket.on('disconnect', () => {
		updatePrimary(null);
		container.classList.add('disconnected');
	});
});