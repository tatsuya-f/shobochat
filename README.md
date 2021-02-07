
# しょぼちゃっと

## Overview
シンプルなチャットアプリです

## Feature
- ステータス欄
    - 操作が成功したかどうか出力されるため，何が起きたのかわかりやすい
- WebSocket
    - 他のユーザーが送った後でも即座に反映される
- Markdown
    - 見やすいメッセージを送ることができる
- 安全性
    - 名前の入力にはエスケープ処理をし，メッセージの入力にはサニタイズ処理

## Requirement
Node.js v10.15.3 以上

## Usage
以下を行うと, http://localhost:8000 でチャットが起動します
```
git clone https://github.com/tatsuya-f/shobochat.git
cd shobochat
npm install
npm run gulp
npm start
```
