const gulp = require("gulp");
const sass = require("gulp-sass");
sass.compiler = require("node-sass");
const ejs = require("gulp-ejs");
const rename = require("gulp-rename");
const glob = require("glob");
const del = require("del");

// Webpack
const webpack = require("webpack-stream");
const VueLoaderPlugin = require("vue-loader/lib/plugin");

const paths = {
	ejs: "src/**/index.ejs",
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
	return gulp.src(paths.ejs, {since: gulp.lastRun(html), base: "src/"})
		.pipe(ejs({}, {rmWhitespace: true}))
    	.pipe(rename({extname: ".html"}))
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
		.pipe(webpack({
			entry: entries,
			mode: NODE_ENV === "production" ? "production" : "development",
			output: {
				filename: "[name]",
			},
			module: {
				rules: [
					{
						test: /\.vue$/,
						use: "vue-loader",
					},
					{
						test: /\.css$/, 
						use: ["vue-style-loader", "css-loader"],
					},
					{
						test: /\.scss$/,
						use: ["vue-style-loader", "css-loader", "sass-loader"],
					}
				]
			},
			plugins: [new VueLoaderPlugin()],
		}))
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
	return gulp.watch(paths.ejs, {ignoreInitial: false}, html);
}
function watch_css() {
	return gulp.watch(paths.scss, {ignoreInitial: false}, css);
}
function watch_javascript() {
	return gulp.watch(paths.js, {ignoreInitial: false}, javascript);
}

exports.default = gulp.series(gulp.parallel(assets, index_assets), gulp.parallel(html, css, javascript));
exports.watch = gulp.series(gulp.parallel(assets, index_assets), gulp.parallel(watch_html, watch_css, watch_javascript));
exports.clean = clean;
