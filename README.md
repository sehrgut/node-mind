node-mind
=========
**mind is not a database** / **minimal database** is lightweight asynchronous
persistence layer for node.

**mind** was inspired by [anti-db][1]'s idea that often, "you don't need a
database, you need an in-memory object that saves itself to disk". However, I
needed Windows support, evented API, and asynchronous loading, which, while
simpler and more elegant in implementation, it forgoes.

## Install
	npm install mind

## Features
* Evented API, as well as a simplified single-callback wrapper
* Automatically persists database state
	* Autosave at intervals, and at `process.exit()`;
	* On non-Windows systems, also autosave on `SIGINT`, `SIGHUP`, and
	`SIGQUIT`.
* Database autocreation

## Usage

### Evented API
```js
var mind = require('mind');

var opts = { encoding: 'UTF-8', autosave: 60000 };
var dbm = new mind('path/to/db.json', opts);

dbm.on('open', function (e) {
	console.log('[INFO] Opened db: ' + e.msg);
	e.db['foo'] = 'bar';
	e.db['baz'] = [1, 2, 3, 4];
});

dbm.on('close', function (e) {
	console.log('[INFO] Closed db: ' + e.msg);
});

dbm.on('save', function (e) {
	console.log('[INFO] Saved db: ' + e.msg);
});

dbm.on('error', function (e) {
	console.error('[ERROR] Error in db: ' + e.msg);
	console.error(e.error);
});

dbm.open();
```

### Callback API
```js
var mind = require('mind');

mind.open('path/to/db.json', function (err, db, data) {
}, 
```

## API

### Class: MindManager

##### new MindManager(fn, opts)
* `fn`: String - Path writeable by the node process
* `opts`: Object - Options hash containing any of:
	* `autosave`: Number - ms between save operations (0 or negative disables
	autosave). Default: `60000`
	* `encoding`: String - encoding used to read and write JSON file. Default:
	`'UTF-8'`

Create a new `MindManager`.
	
##### manager.open()
* Emits `open` on success.

Open and read the database file, creating it if necessary.

##### manager.save()
* Emits `save` on success.

Asynchronously save the database file to disk.

##### manager.close()
* Emits `close` on success.

Synchronously closes the database file, persisting it to disk. This function
is synchronous to support non-autosaved use of **mind**, and is suitable for
calling within `process.exit`.

##### manager.startAutosave() / manager.stopAutosave()

Synchronously start and stop the autosave process.

##### MindManager.getManager(db)
* `db`: Object - Database object for which to get the associated `MindManager`

Get the MindManager for a particular database object.

##### MindManager.open(fn, cb(err, db, data), opts)
* `fn`: see `new MindManager`
* `opts`: see `new MindManager`
* `cb`: Callback used to respond to all events emitted by the created manager:
	* `open`: passes `db` as the new database object
	* `error`: passes `err` as original error thrown, and 
	* `open`, `save`, `close`, `error`: passes `data` as the complete event data object

Handles the creation of a manager object in a simplified single-callback
model. It is recommended to not `bind` your callback to any particular context
so you can access the manager instance at `this`. If you must, though,
the instance managing a particular db object can be accessed by:

```js
mind.getManager(db)
```


#### Events

##### open(event)
`event.db`: The database object opened.
`event.msg`: Any message regarding the open operation.

Emitted on successful opening of a database.

##### close(event)
`event.msg`: Any message regarding the close operation.

Emitted on successful closing of a database.

##### save(event)
`event.msg`: Any message regarding the save operation.

Emitted on successful save of a database to persistent storage, either
explicitly-initiated or autosave.

##### error(event)
`event.error`: The originally-thrown error, if available.
`event.msg`: Any message regarding the error.

Emitted on any non-fatal caught error.

[1]: http://github.com/dpweb/anti-db











