(function() {
	YUI.add('puzzle', function(Y) {
		'use strict';

		/*
		 * Puzzle implementation
		 */
		var Lang = Y.Lang,
			Node = Y.Node,
			BODY = 'body',
			CLICK = 'click',
			HEIGHT = 'height',
			ID = 'id',
			INIT = 'init',
			MOVE = 'move',
			NODE = 'node',
			SLICE_SELECTOR = '.slice',
			SHUFFLE = 'shuffle',
			TARGET_CONTAINER = '#target-container',
			WIDTH = 'width';

		var Puzzle = function(config) {
			Puzzle.superclass.constructor.apply(this, arguments);
		};

		Y.extend(Puzzle, Y.Base, {
			initializer: function(cfg) {
				var imageModelURI;

				this._destNode = Y.one(TARGET_CONTAINER);
				this._destX = this._destNode.getX();
				this._destY = this._destNode.getY();

				imageModelURI = this.get('imageModel');
				this._destNode.setStyle('background', 'url(' + imageModelURI + ')');

				this._btnShuffle = Y.one('#btn-shuffle');
				this._shuffleHandler = this._btnShuffle.on(CLICK, Y.bind(this._shufflePuzzle, this));

				this._initSlices();
			},

			destructor: function() {
				this._shuffleHandler.detach();

				this._slices.each(function(slice, k) {
					slice.dd.destroy();
				}, this);
			},

			_initSlices: function() {
				var imageURI, image;

				imageURI = this.get('image');
				image = new Image();
				image.style.visibility = 'hidden';

				Y.on('load', Y.bind(function() {
					var destNode = this._destNode, cells, rows, imageParts, slice,
						targetSlice, sliceWidth, sliceHeight, i, j, delta, xPos, yPos;

					this._destNodeWidth  = image.width;
					this._destNodeHeight = image.height;

					destNode.setStyle(WIDTH, this._destNodeWidth);
					destNode.setStyle(HEIGHT, this._destNodeHeight);

					imageParts = this.get('partsPerSide');
					this._cells = this._rows = cells = rows = imageParts;

					this._sliceWidth  = sliceWidth  = Math.round(image.width  / imageParts);
					this._sliceHeight = sliceHeight = Math.round(image.height / imageParts);

					for(i = 0, j = 0; i < cells; i++) {
						for(j = 0; j < rows; j++) {
							slice = [
								'<div id="slice_', i, '_', j, '" class="slice" style="background-image: url(', imageURI, '); ',
								'background-position: ', -(j * sliceWidth), 'px ', -(i * sliceHeight), 'px">',
								'</div>'
							 ].join('');

							slice = Node.create(slice);

							targetSlice = Node.create('<div class="target-container-slice"></div>');

							destNode.prepend(targetSlice);
							destNode.appendChild(slice);

							delta = targetSlice.get('offsetWidth') - targetSlice.get('clientWidth');
							slice.setStyle(WIDTH, sliceWidth);
							targetSlice.setStyle(WIDTH, sliceWidth - delta);

							delta = targetSlice.get('offsetHeight') - targetSlice.get('clientHeight');
							slice.setStyle(HEIGHT, sliceHeight);
							targetSlice.setStyle(HEIGHT, sliceHeight - delta);

							xPos = this._destX + (j * sliceWidth);
							yPos = this._destY + (i * sliceHeight);

							slice.setXY([xPos, yPos]);
							targetSlice.setXY([xPos, yPos]);
						}
					}

					this._ddDelegate = new Y.DD.Delegate({
						container: TARGET_CONTAINER,
						nodes: SLICE_SELECTOR
					});

					this._ddDelegate.after('drag:end', Y.bind(this._afterDragEnd, this));
					this._ddDelegate.after('drag:drag', Y.bind(this._afterDragDrag, this));

					this._slices = Node.all(SLICE_SELECTOR);

					this._btnShuffle.removeAttribute('disabled');

					Y.later(0, this, function() {
						Y.one(BODY).removeChild(image);

						this._socket = io.connect(':8080/puzzle');

						this._socket.on(INIT, this._updatePosition);
						this._socket.on(SHUFFLE, this._updatePosition);
						this._socket.on(MOVE, this._updatePosition);

					}, this);
				}, this), image);

				Y.on('error', Y.bind(function() {
					alert('Image cannot be loaded!');
				}, this), image);

				image.setAttribute('src', imageURI);

				Y.one(BODY).appendChild(image);
			},

			_shufflePuzzle: function(e) {
				var pos, data = [], row, cell, sliceWidth, sliceHeight,
					offsetX, offsetY, map = [], i, j, newX, newY;

				sliceWidth = this._sliceWidth;
				sliceHeight = this._sliceHeight;

				offsetX = this._destX + this._destNodeWidth + 10;
				offsetY = this._destY;

				for(i = 0; i < this._cells; i++) {
					map[i] = [];

					for(j = 0; j < this._rows; j++) {
						map[i][j] = false;
					}
				}

				this._slices.each(function(slice, k) {
					do {
						cell = Math.floor(Math.random() * this._cells);
						row = Math.floor(Math.random() * this._rows);
					} while(map[row][cell]);

					map[row][cell] = true;

					newX = cell * sliceWidth + offsetX;
					newY = row * sliceHeight + offsetY;

					pos = [newX, newY];
					slice.setXY(pos);

					data.push({
						id: slice.get(ID),
						pos: pos
					});
				}, this);

				this._socket.emit(SHUFFLE, data);
			},

			_afterDragEnd: function(e) {
				var dd, pos, slice;

				dd = this._ddDelegate.dd;

				slice = dd.get(NODE);

				pos = dd.mouseXY;

				pos = this._moveSlideGracefully(slice, pos);

				this._socket.emit(MOVE, {
					id: slice.get(ID),
					pos: pos
				});
			},

			_afterDragDrag: function(e) {
				var dd, slice;

				dd = this._ddDelegate.dd;

				slice = dd.get(NODE);

				this._socket.emit(MOVE, {
					id: slice.get(ID),
					pos: dd.lastXY
				});
			},

			_getSliceTarget: function(mouseXPos, mouseYPos) {
				var i, j, destX, destY, cell = -1, row = -1, sliceWidth, sliceHeight;

				sliceWidth = this._sliceWidth;
				sliceHeight = this._sliceHeight;
				destX = this._destX;
				destY = this._destY;

				for(i = 0; i < this._cells; i++) {
					if (mouseXPos <= (i*sliceWidth) + sliceWidth + destX) {
						cell = i;
						break;
					}
				}

				for(j = 0; j < this._rows; j++) {
					if (mouseYPos <= (j*sliceHeight) + sliceHeight + destY) {
						row = j;
						break;
					}
				}

				return [row, cell];
			},

			_moveSlideGracefully: function(slice, startPosition) {
				var row, cell, target, sliceWidth, startXPos, startYPos,
					sliceHeight, destX, destY, pos, newX, newY;

				destX = this._destX;
				destY = this._destY;

				startXPos = startPosition[0];
				startYPos = startPosition[1];

				if (startXPos >= destX && startXPos <= (destX + this._destNodeWidth) &&
					startYPos >= destY && startYPos <= (destY + this._destNodeHeight)) {

					sliceWidth = this._sliceWidth;
					sliceHeight = this._sliceHeight;

					target = this._getSliceTarget(startXPos, startYPos);

					row = target[0];
					cell = target[1];

					if (cell >= 0 && row >= 0) {
						newX = cell * sliceWidth + destX;
						newY = row * sliceHeight + destY;

						pos = [newX, newY];
						slice.setXY(pos);
					}
				} else {
					pos = this._ddDelegate.dd.realXY;
				}

				return pos;
			},

			_updatePosition: function(data) {
				data = Y.Array(data);

				Y.Array.each(data, function(slice, index) {
					Y.one('#' + slice.id).setXY(data[index].pos);
				});
			}
		}, {
			NAME: 'Puzzle',

			ATTRS: {
				image: {
					value: '/stylesheets/assets/car.png',
					validator: Lang.isString
				},

				partsPerSide: {
					value: 4,
					validator: function(value) {
						return Lang.isNumber(value) && value > 1;
					}
				},

				imageModel: {
					value: '/stylesheets/assets/car_model.png',
					validator: Lang.isString
				}
			}
		});

		Y.Puzzle = Puzzle;

	}, '0.0.1', { requires: ['dd-delegate'] });

	// instantiate Puzzle module, you can move this in separate file
	YUI().use('puzzle', function(Y) {
		new Y.Puzzle({
			partsPerSide: 5
		});
	});
}());
