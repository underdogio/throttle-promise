function throttle(fn, limit, interval) {
	if (!Number.isFinite(limit)) {
		throw new TypeError('Expected `limit` to be a finite number');
	}

	if (!Number.isFinite(interval)) {
		throw new TypeError('Expected `interval` to be a finite number');
	}

	var queue = [];
	var timeouts = [];
	var activeCount = 0;

	var next = function () {
		activeCount++;

		var id = setTimeout(function () {
			activeCount--;

			if (queue.length > 0) {
				next();
			}

			timeouts = timeouts.filter(function (currentId) {
				return currentId !== id;
			});
		}, interval);

		if (timeouts.indexOf(id) < 0) {
			timeouts.push(id);
		}

		var x = queue.shift();
		x.resolve(fn.apply(x.self, x.args));
	};

	var throttled = function () {
		var args = arguments;
		var that = this;

		return new Promise(function (resolve, reject) {
			queue.push({
				resolve: resolve,
				reject: reject,
				args: args,
				self: that
			});

			if (activeCount < limit) {
				next();
			}
		});
	};

	throttled.abort = function () {
		for (var id of timeouts) {
			clearTimeout(id);
		}
		timeouts = [];

		for (var x of queue) {
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
