function isBool(val) {
	return val === true || val === false;
}

function merge(clobber) {
	var cl = clobber;

	if (isBool(cl))
		delete arguments[0];
	else
		cl = false;

	return Array.prototype.slice.call(arguments)
		.reduce(function (o, x) {
			for (var k in x)
				if (x.hasOwnProperty(k))
					if (cl || ! o.hasOwnProperty(k))
						o[k] = x[k];
				return o;
		}, {});
}

module.exports.merge = merge;
module.exports.lmerge = merge.bind(null, false);
module.exports.rmerge = merge.bind(null, true);
