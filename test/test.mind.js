var fs = require('fs');
var temp = require('temp');
var path = require('path');

var mind = require('../');

var tests = module.exports;
var tempDir = temp.mkdirSync();

tests['create new db with simple interface'] = function (test) {
	test.expect(7);
	mind.open(path.join(tempDir,'test1.json'), function (err, db, data) {
		if (err) throw err;
		
		if (db) {
			test.equal(typeof db.foo, 'undefined', 'value set early');
			test.doesNotThrow(function () {
				db.foo = 'bar';
			}, Error, 'fails to add value');
			test.equal(db.foo, 'bar', 'bad value');
			
			var mm = null;
			
			test.doesNotThrow(function () {
				mm = mind.getManager(db);
			}, Error, 'fails to get manager');
			
			test.ok(mm, 'bad manager');
			test.equal(mm.db, db, 'wrong manager');
			
			test.doesNotThrow(function () {
				mm.close();
			}, Error, 'fails to close gracefully');
			test.done();
		}
	});
};

tests['create new db with event interface'] = function (test) {
	test.expect(4);
	
	var mm = null;
	test.doesNotThrow(function () {
		mm = new mind(path.join(tempDir, 'test2.json'));
	}, Error, 'error creating manager');
	
	mm.on('open', function (e) {
		test.ok(e.db, 'bad database');
		mm.db.foo = 'bar';
		test.equal(mm.db.foo, 'bar', 'bad value');
		mm.save();
	});

	mm.on('save', function (e) {
		test.ok(true, 'onSave');
		mm.close();
		test.done();
	});

	mm.on('error', function (e) {
		throw e.error;
	});
	
	mm.open();
};	
