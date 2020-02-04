const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();

const htmlMinify = require('html-minifier').minify;
const beautify = require('beautify');
const prettyCSS = require('PrettyCSS').parse;
const pretty = require('pretty');
const uglifyJS = require('uglify-js').minify;
const uglifyCSS = require('uglifycss').processString;

const port = process.env.PORT || 5000;

const JS = 'js';
const CSS = 'css';
const HTML = 'html';

app.use(cors());
app.use(bodyParser.json());

app.get('*', function(req, res) {
	res.send('Page not found');
});

app.post('/minify', function(req, res) {
	if (!req.body.type || !req.body.data) {
		return res.json({
			status: 'error',
			data: 'A property was missing'
		});
	}

	if (req.body.type.toLowerCase() === HTML) {
		return res.json({
			status: 'ok',
			data: htmlMinify(req.body.data, {
				collapseWhitespace: true,
				removeComments: true,
				removeTagWhitespace: true,
				minifyCss: true,
				minifyJs: true
			})
		});
	}

	if (req.body.type.toLowerCase() === JS) {
		return res.json({
			status: 'ok',
			data: uglifyJS(req.body.data, {
				mangle: false,
				compress: {
					expression: true,
					conditionals: false,
					inline: false,
					keep_fnames: true,
					negate_iife: false
				},
				output: {
					quote_style: 1,
					braces: true
				}
			}).code
		});
	}

	if (req.body.type.toLowerCase() === CSS) {
		return res.json({
			status: 'ok',
			data: uglifyCSS(req.body.data)
		});
	}

	res.json({
		status: 'error',
		data: '"type" property not recognized'
	});
});

app.post('/beautify', function(req, res) {
	if (!req.body.type || !req.body.data) {
		return res.json({
			status: 'error',
			data: 'A property was missing'
		});
	}

	if (req.body.type.toLowerCase() === JS) {
		return res.json({
			status: 'ok',
			data: beautify(req.body.data, {format: JS})
		});
	}

	if (req.body.type.toLowerCase() === HTML) {
		let html = req.body.data.replace(/\${#(.*?)}/g, '${[[start]]$1}').replace(/\${\/(.*?)}/g, '${[[end]]$1}');

		html = pretty(html);

		html = html.replace(/\${\[\[start\]\](.*?)}/g, '\n${#$1}\n').replace(/\${\[\[end\]\](.*?)}/g, '\n${/$1}\n');

		return res.json({
			status: 'ok',
			data: html
		});
	}

	if (req.body.type.toLowerCase() === CSS) {
		let css = req.body.data.replace(/\${(.*?)}/g, '**$1**');

		css = prettyCSS(css, {
			autocorrect: false
		}).toString();

		css = css.replace(/\*\*(.*?)\*\*/g, '${$1}');

		return res.json({
			status: 'ok',
			data: css
		});
	}

	res.json({
		status: 'error',
		data: '"type" property not recognized'
	});
});

app.listen(port, () => console.log(`Listen to port ${port}`));
