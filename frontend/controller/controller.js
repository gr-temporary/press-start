
var info = document.querySelector(".info");

var dpad = document.querySelector(".d-pad");
var ab = document.querySelector(".a-b");
var startSelect = document.querySelector(".start-select");
var container = document.querySelector(".container");

var buttons = {
	a: false,
	b: false,
	up: false,
	right: false,
	down: false,
	left: false,
	start: false,
	select: false
};

function detectOS() {
	// iOS, Android, Windows PC, Mac, Linux, Windows Phone
	var nav = navigator.userAgent;
	var os = "unknown";
	if(nav.match(/Windows NT/i)) {
		os = "Windows";
	} else if(nav.match(/Macintosh/i)) {
		os = "Mac";
	} else if(nav.match(/Android/i)) {
		os = "Android";
	} else if(nav.match(/iPhone|iPad|iPod/i)) {
		os = "iOS";
	}
	return os;
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
		if(x < 0) {
			buttons.a = true;
		}
		if(x > 0) {
			buttons.b = true;
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
	socket.emit("type", os);
	socket.on('disconnect', () => {
		container.classList.add('disconnected');
	});
});