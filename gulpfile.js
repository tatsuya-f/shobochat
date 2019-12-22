const { src, dest, series } = require("gulp");
const del = require("del");
const browserify = require("browserify");
const notify = require("gulp-notify");
const eslint = require("gulp-eslint");
const mocha = require("gulp-mocha");
const pug = require("gulp-pug");
const plumber = require("gulp-plumber");
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

function compilePug() {
    return src([
            "src/public/pug/*.pug",
            "!src/public/pug/_*.pug",
        ])
        .pipe(plumber({
                errorHandler: notify.onError("Error: <%= error.message %>")
        }))
        .pipe(pug({
            pretty: true,
        }))
        .pipe(dest("dist/public"));
}

function clientIndex() {
    return browserify()
        .add("src/public/js/clientIndex.ts")
        .plugin(tsify, { "extends": "./tsconfig", "include": ["src/public/js/clientIndex.ts"] })
        .bundle()
        .pipe(source("client_index.js"))
        .pipe(dest("dist/public/js"));
}

function clientRegister() {
    return browserify()
        .add("src/public/js/clientRegister.ts")
        .plugin(tsify, { "extends": "./tsconfig", "include": ["src/public/js/clientRegister.ts"] })
        .bundle()
        .pipe(source("client_register.js"))
        .pipe(dest("dist/public/js"));
}

function clientLogin() {
    return browserify()
        .add("src/public/js/clientLogin.ts")
        .plugin(tsify, { "extends": "./tsconfig", "include": ["src/public/js/clientLogin.ts"] })
        .bundle()
        .pipe(source("client_login.js"))
        .pipe(dest("dist/public/js"));
}

function clientChat() {
    return browserify()
        .add("src/public/js/clientChat.ts")
        .plugin(tsify, { "extends": "./tsconfig", "include": ["src/public/js/clientChat.ts"] })
        .bundle()
        .pipe(source("client_chat.js"))
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
        .pipe(mocha({exit: true}));
}

function copy() {
    return src(["src/public/**/*.html", "src/public/**/*.css"])
        .pipe(dest("dist/public"));
}

exports.default = series(clean, lint, test, clientIndex, clientRegister, clientLogin, clientChat, server, compilePug, copy);
exports.clean = clean;
exports.lint = lint;
exports.test = test;
exports.build = series(clientIndex, clientRegister, clientLogin, clientChat, server, compilePug, copy);
