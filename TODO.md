## TODO

* separate save-on-close from autosave as separately-configurable
* better windows-awareness for signal handler attachment
* use readline to capture ctrl-c and readline sigint for interactive programs
* test save and restore of db
* event messages carry filename
* MindManager#isOpen/#status (best way other db connectors use?)
* Allow an "initialization object" for the db if empty
* Expose saveSync publicly
* startAutosave/stopAutosave events
* allow startAutosave(new_interval_ms) to override opts.autosave (perm or just for that invocation of start?)
* maybe save-on-exit should be mandatory? Too much config and might as well just use mongo.