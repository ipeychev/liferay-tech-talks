(function() {
	YUI.add('editor-file-acess', function(Y){
		'use strict';

		var YAHOO = Y.YUI2,
			TMP_FILE = '.curArticle';
		
		var EditorFileAccess = function() {
			EditorFileAccess.superclass.constructor.apply(this, arguments);
		};

		Y.extend(EditorFileAccess, Y.Base, {
			initializer: function(config) {
				var fileSystem;

				var articleEditor = this._articleEditor = new YAHOO.widget.Editor('aricle_editor');

				var boundOnError = this._boundOnError = Y.bind(this._onError, this);

				articleEditor.on('editorContentLoaded', function() {
					var requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;

					if (requestFileSystem) {
						requestFileSystem(window.TEMPORARY, 1048576, Y.bind(this._onInitFileSystem, this), boundOnError);
					}
				}, null, this);

				articleEditor.render();

				Y.one('#deleteFile').on('click', function(e) {
					fileSystem.root.getFile(TMP_FILE, {create: false}, function(fileEntry) {
						fileEntry.remove(function() {
							articleEditor.setEditorHTML('');

							this._readFileContent();
						}, boundOnError);
					}, boundOnError);
				}, this);
			},

			_onInitFileSystem: function(persistentFileSystem) {
				var lastSavedData;

				this._fileSystem = persistentFileSystem;

				this._readFileContent();

				var articleEditor = this._articleEditor;

				Y.later(2000, this, function(e){
					var data = articleEditor.cleanHTML(articleEditor.getEditorHTML());

					if (data && data != lastSavedData) {
						this._saveArticle(TMP_FILE, data, false);

						lastSavedData = data;
					}
				}, null, true);
			},

			_onError: function(event) {
				var message;

				switch (event.code) {
					case FileError.QUOTA_EXCEEDED_ERR:
						message = 'QUOTA_EXCEEDED_ERR';
					break;

					case FileError.NOT_FOUND_ERR:
						message = 'NOT_FOUND_ERR';
					break;

					case FileError.SECURITY_ERR:
						message = 'SECURITY_ERR';
					break;

					case FileError.INVALID_MODIFICATION_ERR:
						message = 'INVALID_MODIFICATION_ERR';
					break;

					case FileError.INVALID_STATE_ERR:
						message = 'INVALID_STATE_ERR';
					break;

					default:
						message = 'Unknown Error';
				}

				alert(message);
			},

			_readFileContent: function() {
				var instance = this;

				instance._fileSystem.root.getFile(TMP_FILE, {create: false}, function (fileEntry) {
					fileEntry.file(function(file) {
						var fileReader = new FileReader();

						fileReader.onloadend = function(event) {
							var data = fileReader.result;

							instance._articleEditor.setEditorHTML(data);
						};

						fileReader.readAsText(file, 'uttf8');
					});
				});
			},

			_saveArticle: function(fileName, data, newFile) {
				var instance = this;

				this._fileSystem.root.getFile(fileName, {create: true, exclusive: newFile}, function(fileEntry) {
					fileEntry.createWriter(function(fileWriter) {
						var bb, blobBuilder;

						fileWriter.onwriteend = function(e) {
							console.log('Write completed.');
						};

						fileWriter.onerror = function(e) {
							console.log('Write failed: ' + e.toString());
						};

						blobBuilder = window.BlobBuilder || window.WebKitBlobBuilder;

						bb = new blobBuilder();

						bb.append(data);

						fileWriter.write(bb.getBlob('text/html'));
					}, instance._boundOnError);
				}, instance._boundOnError);
			}
		}, {
			NAME: 'EditorFileAccess'
		});

		Y.EditorFileAccess = EditorFileAccess;

	}, '0.0.1', { requires: ['base', 'node', 'yui2-editor'] });

	// instantiate Y.EditorFileAccess module, you can move this in separate file
	YUI().use('editor-file-acess', function(Y) {
		new Y.EditorFileAccess();
	});
}());
