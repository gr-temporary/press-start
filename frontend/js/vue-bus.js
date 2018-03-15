
class Bus {
	constructor() {
		this.callbacks = {};
	}

	on(name, callback) {
		if(this.callbacks[name]) {
			this.callbacks[name].push(callback);
		} else {
			this.callbacks[name] = [callback];
		}
	}

	emit(name, data) {
		if(this.callbacks[name]) {
			const c = this.callbacks[name];
			c.forEach(x => x(data));
		}
	}
}

const bus = new Bus();

module.exports = bus;