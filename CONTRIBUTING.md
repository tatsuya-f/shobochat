
## ファイル構成

ファイル構成は以下のとおりです。
```
▸  dist/
▸  node_modules/
▾  src/
  ▾  public/
    ▾  css/
         chat.css                       # chatページのCSS
         page.css                       # chat以外のページのCSS
    ▾  js/
         clientChat.ts                  # chat.html     のクライアント
         clientIndex.ts                 # index.html    のクライアント
         clientLogin.ts                 # login.html    のクライアント
         clientRegister.ts              # register.html のクライアント
         clientSetting.ts               # setting.html  のクライアント
         Message.ts  -> src/Message.ts
         messageHandler.ts              # Messageに関する関数
         User.ts  -> src/User.ts
    ▾  pug/
      ▸  markdown/
      ▾  parts/
           _head.pug                    # <head>のパーツ
           _input_area.pug              # 入力欄のパーツ
           _menu.pug                    # 右クリックしたときに出てくるボタンのパーツ
           _navigation.pug              # ナビゲーションバーのパーツ
           _popup_window.pug            # helpとかのポップアップウィンドウのパーツ
           _title.pug                   # login.htmlとかのタイトルのパーツ
         chat.pug                       # chat.html
         index.pug                      # index.html
         login.pug                      # login.html
         register.pug                   # register.html
         setting.pug                    # setting.html
  ▾  route/
       chat.ts                          # /chat
       index.ts                         # /
       login.ts                         # /login
       messages.ts                      # /messages
       register.ts                      # /register
       setting.ts                       # /setting
     dbHandler.ts                       # データベースの関数たち
     hashPassword.ts                    # passwordをハッシュ化する関数
     loginHandler.ts                    # loginしてあるかなどログイン状態に関する関数
     Message.ts                         # Messageに関する型
     primeHandler.ts                    # 素数の関数
     server.ts                          # サーバーのメイン
     User.ts                            # Userに関する型
     webSocketHandler.ts                # ウェブソケットに関する型
▸  test/
```

## 注意事項
pugディレクトリはコンパイルして、index.htmlになります。また、生成ルールとして、`_`から始まるpugファイルは生成されませんので、パーツを作るときはファイル名の前に`_`をつけてください。
また、静的なコンテンツの場合は、markdownとして記述して取り込む(例: `_popup_window.pug`のhelpの感じ)ようにしたほうが、書きやすいと思われます。
Pugの文法は[pug文法 GitBook](https://du-masa.github.io/study-frontend/pug/pug-lang.html)が分かりやすかったです。

