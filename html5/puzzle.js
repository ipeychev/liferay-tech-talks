var MOVE = 'move',
	SHUFFLE = 'shuffle';

var Puzzle = function(config) {
	this._config = config;
};

Puzzle.prototype = {
	constructor: Puzzle,

	run: function(io) {
		'use strict';

		var slices = [];

		var puzzleServer = io.of('/puzzle').on('connection', function(socket) {
			socket.emit('init', slices);

			socket.on(SHUFFLE, function(data) {
				slices = data.slice(0);

				socket.broadcast.emit(SHUFFLE, slices);
			});

			socket.on(MOVE, function(slice) {
				slices.some(function(tmpSlice, index) {
					if (tmpSlice.id == slice.id) {
						tmpSlice.pos = slice.pos;

						socket.broadcast.emit(MOVE, slice);

						return true;
					}

					return false;
				});
			});
		});
	}
};

module.exports.Puzzle = Puzzle;