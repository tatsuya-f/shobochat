const { src, dest, series } = require("gulp");
const del = require("del");
const browserify = require("browserify");
const eslint = require("gulp-eslint");
const mocha = require("gulp-mocha");
const source = require ("vinyl-source-stream");
const tsify = require("tsify");

function clean() {
    return del(["dist"]);
}

function lint() {
    return src("src/**/*.ts")
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
}

function client() {
    return browserify()
        .add("src/public/js/client.ts")
        .plugin(tsify, { "extends": "./tsconfig", "include": ["src/public/js/*"] })
        .bundle()
        .pipe(source("client_bundle.js"))
        .pipe(dest("dist/public/js"));
}

function server() {
    return browserify({ "node": true, "bundleExternal": false })
        .add("src/server.ts")
        .plugin(tsify, { "extends": "./tsconfig", "include": ["src/*"] })
        .bundle()
        .pipe(source("server_bundle.js"))
        .pipe(dest("dist"));
}

function test() {
    return src("test/*")
        .pipe(mocha());
}

function copy() {
    return src(["src/public/**/*.html", "src/public/**/*.css"])
        .pipe(dest("dist/public"));
}

exports.default = series(clean, lint, test, client, server, copy);
exports.clean = clean;
exports.lint = lint;
exports.test = test;
exports.build = series(client, server, copy);
