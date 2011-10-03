(function() {
	YUI.add('chat', function(Y) {
		'use strict';

		var MESSAGE_TAG_START = '<div class="chat-message">',
			MESSAGE_TAG_END = '</div>',
			MESSAGE = 'message',
			VALUE = 'value';

		var Chat = function(config) {
			Chat.superclass.constructor.apply(this, arguments);
		};

		Y.extend(Chat, Y.Base, {
			initializer: function(config) {
				this._chatLogContent = Y.one('#chatLogContent');
				this._chatUsersContent = Y.one('#chatUsersContent');
				var chatDataContent = this._chatDataContent = Y.one('#chatDataContent');
				var chatDataContentSend = this._chatDataContentSend = Y.one('#chatDataContentSend');

				chatDataContent.focus();

				var socket = this._socket = io.connect(':8080/chat');

				socket.on(MESSAGE, Y.bind(this._onMessage, this));

				socket.on('system', Y.bind(this._onMessageSystem, this));

				socket.on('user', Y.bind(this._onMessageUser, this));

				socket.on('users', Y.bind(this._onMessageUsers, this));

				Y.on('keypress', this._onKeyPress, chatDataContent, this);

				Y.on('click', this._sendData, chatDataContentSend, this);
			},

			destructor: function() {
			},

			_onKeyPress: function(event) {
				if (event.charCode == 13) {
					this._sendData();
				}
			},

			_onMessage: function(message) {
				var chatLogContent = this._chatLogContent;

				chatLogContent.append(MESSAGE_TAG_START + message + MESSAGE_TAG_END);

				this._scrollContainer(chatLogContent);
			},

			_onMessageSystem: function(message) {
				var chatLogContent = this._chatLogContent;

				chatLogContent.append(MESSAGE_TAG_START + message + MESSAGE_TAG_END);

				this._scrollContainer(chatLogContent);
			},

			_onMessageUser: function(data) {
				var connected = data.connected;

				var chatUsersContent = this._chatUsersContent;

				if (connected) {
					chatUsersContent.appendChild(Y.Node.create(MESSAGE_TAG_START + data.user + MESSAGE_TAG_END));
				} else {
					chatUsersContent.get('children').some(function(item, index, collection) {
						if (item.get('text') === data.user) {
							item.remove();

							return true;
						}

						return false;
					});
				}

				this._scrollContainer(chatUsersContent);
			},

			_onMessageUsers: function(message) {
				var chatUsersContent = this._chatUsersContent;

				chatUsersContent.set('innerHTML', message);

				this._scrollContainer(chatUsersContent);
			},

			_scrollContainer: function(container) {
				container.set('scrollTop', container.get('scrollHeight'));
			},

			_sendData: function() {
				var chatDataContent = this._chatDataContent;

				var data = chatDataContent.get(VALUE);

				if (data) {
					this._socket.emit(MESSAGE, data);

					chatDataContent.set(VALUE, '');

					chatDataContent.focus();
				}
			}
		}, {
			NAME: 'Chat'
		});

		Y.Chat = Chat;

	}, '0.0.1', { requires: ['base', 'node'] });

	// instantiate Chat module, you can move this in separate file
	YUI().use('chat', function(Y) {
		new Y.Chat();
	});
}());