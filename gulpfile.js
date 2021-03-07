const gulp = require("gulp");
const sass = require("gulp-sass");
sass.compiler = require("node-sass");
const rename = require("gulp-rename");
const glob = require("glob");
const del = require("del");
const handler = require("serve-handler");
const http = require("http");
const pug = require("pug");
const gulp_pug = require("gulp-pug");

// Webpack
const webpack = require("webpack");
const webpackStream = require("webpack-stream");

const paths = {
	pug: "src/**/index.pug",
	scssPartials: "src/**/_*.scss",
	scss: "src/**/style.scss",
	js: "src/**/script.js",
	assets: "src/**/assets/**",
	index_assets: "src/index_assets/**",
}

const NODE_ENV = process.env.NODE_ENV;

function clean() {
	return del(["dist/**", "!dist"]);
}

function html() {
	return gulp.src(paths.pug, {since: gulp.lastRun(html), base: "src/"})
		.pipe(gulp_pug({pug: pug}))
		.pipe(gulp.dest("./dist"))
}
function css() {
	return gulp.src(paths.scss, {since: gulp.lastRun(css), base: "src/"})
		.pipe(sass({outputStyle: NODE_ENV === "production" ? "compressed" : "expanded"}))
		.pipe(gulp.dest("./dist"))
}
function javascript() {
	filepaths = glob.sync(paths.js);
	entries = {};
	for (filepath of filepaths) {
		output = "." + filepath.substring(filepath.indexOf("/"));
		entries[output] = "./" + filepath;
	}
	return gulp.src(paths.js, {since: gulp.lastRun(javascript), base: "src/"})
		.pipe(webpackStream({
			entry: entries,
			mode: NODE_ENV === "production" ? "production" : "development",
			devtool: NODE_ENV === "production" ? false : "source-map",
			output: {
				filename: "[name]",
			},
			module: {
				rules: [
					{
						test: /\.css$/, 
						use: ["css-loader"],
					},
					{
						test: /\.scss$/,
						use: ["css-loader", "sass-loader"],
					}
				]
			},
		}, webpack))
		.pipe(gulp.dest("./dist"))
}
function assets() {
	return gulp.src(paths.assets, {since: gulp.lastRun(assets), base: "src/"})
		.pipe(gulp.dest("./dist"))
}
function index_assets() {
	return gulp.src(paths.index_assets, {since: gulp.lastRun(index_assets), base: "src/index_assets/"})
		.pipe(gulp.dest("./dist"))
}

function watch_html() {
	return gulp.watch(paths.pug, {ignoreInitial: false}, html);
}
function watch_css() {
	return gulp.watch(paths.scss, {ignoreInitial: false}, css);
}
function watch_javascript() {
	return gulp.watch(paths.js, {ignoreInitial: false}, javascript);
}

const server = http.createServer((req, res) => {
	return handler(req, res, {
		public: "dist/"
	});
})

function serve() {
	return server.listen(5000, () => {
		console.log("Running server on http://localhost:5000");
	});
}

exports.default = gulp.series(clean, gulp.parallel(assets, index_assets), gulp.parallel(html, css, javascript));
exports.watch = gulp.series(clean, gulp.parallel(assets, index_assets), gulp.parallel(watch_html, watch_css, watch_javascript));
exports.clean = clean;
exports.dev = gulp.series(clean, gulp.parallel(assets, index_assets), gulp.parallel(watch_html, watch_css, watch_javascript, serve));