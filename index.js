#!/usr/bin/env node
"use strict";
/**
 * 计算指定路径的ts文件占比。
 * 用户使用输入指令： tsrate -- [dirName]
 * dirName空，则遍历src，没有src则遍历根目录
 * dirName有值，则遍历指定目录
 */
const Fs = require('fs');
const Path = require('path');
var chalk = require('chalk');

const info = chalk.bold.cyan;

let fileTypesNumberMap = {};

// const src = Path.resolve(__dirname, './src/');
const src = Path.resolve('./src/');
const defaultPath = Path.resolve('./');

function main() {
  let flag = false;
  const params = process.argv.splice(2);
  if(params && params[0]){
    // const newPath = Path.resolve(__dirname, params[0]);
    const newPath = Path.resolve(params[0]);
    console.log(info(`开始统计${params[0]}`));
    if (Fs.existsSync(newPath)) {
      flag = true;
      traversals(newPath);
    }
  }
  if(!flag) {
    // 匹配不到指定路径。直接开始遍历src下所有文件
    if (Fs.existsSync(src)) {
      console.log(info(`开始统计${src}`));
      traversals(src);
    } else {
    // 匹配不到src。直接开始遍历根目录下所有文件
      if (Fs.existsSync(defaultPath)) {
        console.log(info(`开始统计${defaultPath}`));
        traversals(defaultPath);
      }
    }
  }
  printRs();
}

function traversals(root) {
  // 读取目录中的所有文件/目录
  const dirents = Fs.readdirSync(root, { withFileTypes: true });
  dirents.forEach(function(dirent) {
    const _path = Path.resolve(root, dirent.name);
    if (dirent.isFile()) {
      const type = Path.extname(dirent.name).slice(1);
      fileTypesNumberMap[type] = fileTypesNumberMap[type]
        ? fileTypesNumberMap[type] + 1
        : 1;
    }
    // 如果是目录则递归调用自身
    else if (dirent.isDirectory()) {
      traversals(_path);
    }
  });
}

function printRs() {
  const rs = Object.entries(fileTypesNumberMap);
  console.table(rs);

  const jsNumber = fileTypesNumberMap.js;
  const tsNumber = fileTypesNumberMap.ts + fileTypesNumberMap.tsx;
  const all = jsNumber + tsNumber;
  const rate = all ? tsNumber / all : 0;
  console.log(info(`ts比率：${rate * 100}% (ts+tsx/ts+tsx+js)`));
}

main();
