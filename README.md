TT
=======
> 利用Firebase，Angular和node-webkit开发的一款适用于windows，mac和linux平台的一对一聊天平台。

## Install
+ 把该文件clone到本地 
```bash
git clone https://github.com/Goldenstone/tt.git
```
+ 该应用是由gulp搭建的结构，所以需要在全局安装gulp 
```bash
npm install -g gulp
```
+ 进行`bower install`和`npm install` 
```bash
gulp make
```
+ 运行程序 
```bash
gulp run
```

## Build
+ 生成mac版本 
```bash 
gulp build-osx
```
+ 生成windows版本 
```bash
gulp build-win
```
+ 生成linux版本 
```bash
gulp build-linux
```
