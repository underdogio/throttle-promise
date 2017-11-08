function throttle(fn, limit, interval) {
	if (!Number.isFinite(limit)) {
		throw new TypeError('Expected `limit` to be a finite number');
	}

	if (!Number.isFinite(interval)) {
		throw new TypeError('Expected `interval` to be a finite number');
	}

	const queue = [];
	let timeouts = [];
	let activeCount = 0;

	const next = function () {
		activeCount++;

		const id = setTimeout(function () {
			activeCount--;

			if (queue.length > 0) {
				next();
			}

			timeouts = timeouts.filter(currentId => currentId !== id);
		}, interval);

		if (timeouts.indexOf(id) < 0) {
			timeouts.push(id);
		}

		const x = queue.shift();
		x.resolve(fn.apply(x.self, x.args));
	};

	const throttled = function () {
		const args = arguments;

		return new Promise((resolve, reject) => {
			queue.push({
				resolve,
				reject,
				args,
				self: this
			});

			if (activeCount < limit) {
				next();
			}
		});
	};

	throttled.abort = function () {
		for (const id of timeouts) {
			clearTimeout(id);
		}
		timeouts = [];

		for (const x of queue) {
			x.reject(new throttle.AbortError());
		}
		queue.length = 0;
	};

	return throttled;
}

function AbortError() {
	Error.call(this, 'Throttled function aborted');
	this.name = 'AbortError';
}

throttle.AbortError = AbortError;

module.exports = throttle;
