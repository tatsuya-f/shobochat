const { task, watch, src, dest, series, parallel } = require("gulp");
const del = require("del");
const browserify = require("browserify");
const notify = require("gulp-notify");
const eslint = require("gulp-eslint");
const mocha = require("gulp-mocha");
const pug = require("gulp-pug");
const plumber = require("gulp-plumber");
const source = require ("vinyl-source-stream");
const tsify = require("tsify");
const ts = require("gulp-typescript");
const tsProject = ts.createProject("tsconfig.json");
const prettierPlugin = require('gulp-prettier-plugin');
const kill = require("tree-kill");


function clean() {
    return del(["dist"]);
}

function lint() {
    return src("src/**/*.ts")
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
}

function prettier() {
    return src("src/**/*.ts")
        .pipe(prettierPlugin(
            {
                printWidth: 120,
                    tabWidth: 4
            }, 
            { 
                filter: true 
            }
        )).pipe(dest(file => file.base));
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

function clientSetting() {
    return browserify()
        .add("src/public/js/clientSetting.ts")
        .plugin(tsify, { "extends": "./tsconfig", "include": ["src/public/js/clientSetting.ts"] })
        .bundle()
        .pipe(source("client_setting.js"))
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

function checkServer() {
    const tsResult = src("src/server/**/*.ts")
        .pipe(tsProject());
    return tsResult.js.pipe(dest("tmp"));
}

function checkCommon() {
    const tsResult = src("src/common/**/*.ts")
        .pipe(tsProject());
    return tsResult.js.pipe(dest("tmp"));
}

function cleanTmp() {
    return del(["tmp"]);
}

function test() {
    return src("test/*")
        .pipe(mocha({exit: true}));
}

function copyHtmlAndCss() {
    return src(["src/public/**/*.html", "src/public/**/*.css"])
        .pipe(dest("dist/public"));
}

function copyServer() {
    return src(["src/server/**/*.ts"])
        .pipe(dest("dist/server"));
}

function copyCommon() {
    return src(["src/common/**/*.ts"])
        .pipe(dest("dist/common"));
}

task("watch", () => {
    series(clean, prettier, lint, test,
        parallel(clientIndex, clientRegister, clientLogin, clientSetting, clientChat),
        checkServer, checkCommon,
        cleanTmp,
        compilePug, copyHtmlAndCss,
        copyServer, copyCommon)();
    watch("src/server/**/*.ts", series(
        prettier, lint, checkServer, cleanTmp, copyServer, cleanTmp,
    ));
    watch("src/public/js/**/*.ts", series(
        prettier, lint,
        clientIndex, clientRegister, clientLogin, clientSetting, clientChat, cleanTmp,
    ));
    watch("src/common/**/*.ts", series(
        prettier, lint, 
        checkServer, cleanTmp, copyServer,
        clientIndex, clientRegister, clientLogin, clientSetting, clientChat,
        copyCommon, cleanTmp,
    ));
    watch("src/public/pug/**/*.pug", series(compilePug));
    watch("src/public/css/**/*.css", series(copyHtmlAndCss));
    watch("test/**/*.ts", series(test));
});

exports.default = series(clean, prettier, lint, test, parallel(clientIndex, clientRegister, clientLogin, clientSetting, clientChat), checkServer, checkCommon, cleanTmp, compilePug, copyHtmlAndCss, copyServer, copyCommon);
exports.clean = clean;
exports.lint = lint;
exports.test = test;
exports.build = series(clientIndex, clientRegister, clientLogin, clientSetting, clientChat, checkServer, checkCommon, cleanTmp, compilePug, copyHtmlAndCss, copyServer, copyCommon);
exports.server = series(checkServer, checkCommon, cleanTmp, copyServer, copyCommon, copyHtmlAndCss);
exports.client = series(clientIndex, clientRegister, clientLogin, clientSetting, clientChat);
exports.pug = series(compilePug, copyHtmlAndCss);
exports.css = series(copyHtmlAndCss);
