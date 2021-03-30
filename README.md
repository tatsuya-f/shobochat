
# しょぼちゃっと

## Overview
シンプルなチャットアプリです

## Feature
- WebSocketを使用
    - 送信したメッセージが即座に反映される
- Markdownに対応
    - 見やすいメッセージを送信することができる

## Requirement
Node.js v10.15.3 以上

## Usage
以下を行い， http://localhost:8000 にアクセスすると，チャットアプリを使用できます

※ パスワードは4文字以上でないと登録できません
```
git clone https://github.com/tatsuya-f/shobochat.git
cd shobochat
npm install
npm run gulp
npm start
```
