
# しょぼちゃっと

## Overview
シンプルなチャットアプリです

## Feature
- WebSocketを使用
    - 送信したメッセージが即座に反映される
- Markdownに対応
    - 見やすいメッセージを送信することができる

## Usage
以下を行い， http://localhost:8000 にアクセスすると，チャットアプリを使用できます

```
git clone https://github.com/tatsuya-f/shobochat.git
cd shobochat
docker build . -t <your username>/shobochat
docker run -p 8000:8000 -p 8080:8080 -d <your username>/shobochat
```
