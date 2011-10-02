var express = require('express'),
	hbs = require('hbs'),
	util = require('util');

var app = module.exports = express.createServer();

var io = null;

var chat = null;
var puzzle = null;

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'hbs');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({
	  dumpExceptions: true,
	  showStack: true
  }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

hbs.registerHelper('link_to', function(context) {
  return '<a href="' + context.href + '">' + context.value + '</a>';
});

hbs.registerHelper('list', function(items, fn) {
	var i, len, res = [];

	 res.push('<ul>');

	for(i = 0, len = items.length; i < len; i++) {
		res.push('<li>', fn(items[i]), '</li>');
	}

	res.push('</ul>');

	return res.join('');
});

hbs.registerHelper('array', function(items, fn) {
	var i, len, res = [], value;

	if (items) {
		for(i = 0, len = items.length; i < len; i++) {
			value = fn(items[i]);

			res.push(value);
		}
	}

	return res;
});

hbs.registerPartial('cssLink', '<link rel="stylesheet" type="text/css" href="{{href}}">');

hbs.registerPartial('link', '<a href="{{href}}">{{value}}</a>');

// Routes

app.get('/', function(req, res) {
	res.render('index', {
		title: 'HTML5 and CSS3',
		html5: [
			{
				href: '/communication',
				value: 'Communication'
			},
			{
				href: '/multimedia',
				value: 'Multimedia'
			},
			{
				href: '/file-access',
				value: 'File Access'
			},
			{
				href: '/history',
				value: 'History'
			},
			{
				href: '/input-fileds',
				value: 'Input fields'
			},
		],
		css3: [
			{
				href: '/css3',
				value: 'CSS3'
			}
		]
	});
});

app.get('/communication', function(req, res) {
	res.render('communication', {
		title: 'Communication'
	});
});

app.get('/communication/chat', function(req, res) {
	if (!io) {
		io = require('socket.io').listen(app);
	}

	if (!chat) {
		chat = new (require('./chat.js').Chat)();

		chat.run(io);
	}

	res.render('chat', {
		cssLinks: [
			{
				href: 'http://yui.yahooapis.com/3.4.0/build/cssgrids/grids-min.css'
			},
			{
				href: '/stylesheets/chat.css'
			}
		],
		title: 'Simple chat server'
	});
});

app.get('/communication/puzzle', function(req, res) {
	if (!io) {
		io = require('socket.io').listen(app);
	}

	if (!puzzle) {
		puzzle = new (require('./puzzle.js').Puzzle)();

		puzzle.run(io);
	}

	res.sendfile(__dirname + '/public/puzzle.html');
});

app.get('/css3', function(req, res) {
	res.render('css3', {
		cssLinks: [
			{
				href: '/stylesheets/css3.css'
			}
		],
		title: 'CSS3'
	});
});

app.get('/input-fileds', function(req, res) {
	res.render('input_fields', {
		cssLinks: [
			{
				href: '/stylesheets/input_fields.css'
			}
		],
		title: 'Input fields'
	});
});

app.get('/file-access', function(req, res) {
	res.render('file_access', {
		title: 'File access'
	});
});

app.get('/history', function(req, res) {
	var url = req.url;

	if (url.charAt(url.length - 1) != '/') {
		url += '/';
	}

	res.render('history', {
		title: 'HTML5 History API',
		links: [
			{url: url + 'page1', value: 'Page1'},
			{url: url + 'page2', value: 'Page2'},
			{url: url + 'page3', value: 'Page3'},
			{url: url + 'page4', value: 'Page4'},
			{url: url + 'page5', value: 'Page5'},
			{url: url + 'page6', value: 'Page6'},
			{url: url + 'page7', value: 'Page7'},
			{url: url + 'page8', value: 'Page8'},
			{url: url + 'page9', value: 'Page9'},
			{url: url + 'page10', value: 'Page10'}
		]
	});
});

app.get('/multimedia', function(req, res) {
	res.render('multimedia', {
		title: 'HTML5 Multimedia'
	});
});

app.listen(8080);

console.log('Express server listening on port %d in %s mode', app.address().port, app.settings.env);

