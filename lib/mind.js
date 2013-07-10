var fs = require('fs');
var EventEmitter = require('events').EventEmitter;
var merge = require('./merge');

var defaults = {
	autosave: 10000,
	encoding: 'UTF-8'
};

function MindManager (fn, opts) {
	this._fn = fn;
	this.opts = merge.rmerge(defaults, opts);
	this.db = null;
}

MindManager.prototype = new EventEmitter();

MindManager._minds = [];

function first(a, cb) {
	return a[find(a, cb)];
}

function find(a, cb) {
	for (var i=0, n=a.length; i<n; i++)
		if (cb(a[i], i, a))
			return i;
	return -1;
}

function eqp(n, v, o) {
	return o[n] === v;
}

MindManager.getManager = function (db) {	
	return first(MindManager._minds, eqp.bind(null, 'db', db));
};

MindManager._register = function (m) {
	if (MindManager._minds.indexOf(m) == -1)
		MindManager._minds.push(m);
};

MindManager._unregister = function (m) {
	var i = MindManager._minds.indexOf(m);
	if (i > -1)
		MindManager._minds.splice(i, 1);
};

MindManager.prototype.open = function () {
	if (fs.existsSync(this._fn)) {
		fs.readFile(this._fn, {encoding: this.opts.encoding}, this._onRead.bind(this));
	} else {
		this._doCreate();
	}
};

MindManager.prototype.save = function () {
	function onSaved(err) {
		if (err) {
			this.emit('error', { msg: 'Error saving database file.', error: err });
		} else {
			this.emit('save', { msg: 'Database file save successful.' });
		}
	}
	
	if (this.db)
		fs.writeFile(this._fn, JSON.stringify(this.db), {encoding: this.opts.encoding}, onSaved.bind(this));
};

MindManager.prototype.close = function () {
	try {
		this.stopAutosave();
		this._uncatchSignals();
		this._saveSync();
		this.db = null;
		MindManager._unregister(this);
		this.emit('close', { msg: 'Database successfully closed.' });
	} catch (e) {
		emit('error', { msg: 'Error closing database.', error: e });
	}
};

MindManager.prototype.startAutosave = function () {
	if (this.opts.autosave > 0) {
		this._saveInterval = setInterval(this._doAutosave.bind(this), this.opts.autosave);
		this._saveInterval.unref();
		return true;
	}
	return false;
};

MindManager.prototype.stopAutosave = function () {
	if (this._saveInterval)
		clearInterval(this._saveInterval);
};

MindManager.prototype._doAutosave = function () {
	if (this._fn)
		this.save();
};

MindManager.prototype._doCreate = function() {
	fs.open(this._fn, 'a', this._onCreated.bind(this));
};

MindManager.prototype._onCreated = function(err, fd) {
	if (err) {
		this.emit('error', { msg: "Could not create database file.", error: err });
	} else {
		try {
			fs.closeSync(fd);
			this._onOpened({});
		} catch (e) {
			this.emit('error', { msg: "Error closing created database file.", error: err });
		}
	}
};

MindManager.prototype._onRead = function (err, data) {
	if (err) {
		this.emit('error', { msg: 'Error opening database file.', error: e });
	} else {			
		try {
			this._onOpened(data ? JSON.parse(data) : {});
		} catch(e) {
			this.emit('error', { msg: 'Error parsing database file.', error: e });
		}
	}
};

MindManager.prototype._saveSync = function () {
	if (this.db)
		fs.writeFileSync(this._fn, JSON.stringify(this.db), {encoding: this.opts.encoding});
};

MindManager.prototype._catchSignals = function () {
	this._sigcatcher = this._saveSync.bind(this);
	process
		.on('exit', this._sigcatcher)
		.on('SIGINT', this._sigcatcher)
		.on('SIGQUIT', this._sigcatcher)
		.on('SIGHUP', this._sigcatcher);
};

MindManager.prototype._uncatchSignals = function () {
	if(this._sigcatcher)
		process
			.removeListener('exit', this._sigcatcher)
			.removeListener('SIGINT', this._sigcatcher)
			.removeListener('SIGQUIT', this._sigcatcher)
			.removeListener('SIGHUP', this._sigcatcher);
};

MindManager.prototype._onOpened = function (o) {
	this.startAutosave();
	this._catchSignals();
	this.db = o;
	MindManager._register(this);
	this.emit('open', { msg: 'Successfully loaded database.', db: this.db });
}

MindManager.open = function (fn, cb, opts) {
	var mm = new MindManager(fn, opts)
		.on('open', function (e) { cb(null, this.db, e); })
		.on('close', function (e) { cb(null, null, e); })
		.on('save', function (e) { cb(null, null, e); })
		.on('error', function (e) { cb(e.error, null, e); });
	
	mm.open();
};

module.exports = MindManager;

/* TEST HARNESS */

MindManager.open('test.mind.json', function (err, db, data) {
	if (err) {
		console.error('[ERROR] ' + err);
	} else if (db) {
		console.log(db);
		db.foo = 'bar';
		console.log(db);
		var m = MindManager.getManager(db);
		m.save();
	} else {
		console.error('[INFO] ' + data.msg);
	}
});