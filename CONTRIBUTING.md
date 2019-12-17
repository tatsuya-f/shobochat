
## ファイル構成

ファイル構成は以下のとおりです。
```
▸  dist/
▸  node_modules/
▾  src/
  ▾  public/
    ▾  css/
         style.css
    ▾  js/
         client.ts
         Message.ts  -> /home/kouga/uni/soft/team01/src/Message.ts
         messageHandler.ts
    ▾  pug/
      ▾  markdown/
           help.md              # ヘルプの内容
         _input_area.pug        # 入力欄のパーツ
         _navigation.pug        # ナビゲーションバーのパーツ
         _popup_window.pug      # popup windowのパーツ
         index.pug              # -> index.html
     dbHandler.ts
     Message.ts
     server.ts
▾  test/
     escapeHTML.spec.ts
     hasChar.spec.ts
     test.ts
   CONTRIBUTING.md
   gulpfile.js
   package-lock.json
   package.json
   README.md
   tsconfig.json
```

## 注意事項
pugディレクトリはコンパイルして、index.htmlになります。また、生成ルールとして、`_`から始まるpugファイルは生成されませんので、パーツを作るときはファイル名の前に`_`をつけてください。
また、静的なコンテンツの場合は、markdownとして記述して取り込む(例: `_popup_window.pug`のhelpの感じ)ようにしたほうが、書きやすいと思われます。
Pugの文法は[pug文法 GitBook](https://du-masa.github.io/study-frontend/pug/pug-lang.html)が分かりやすかったです。

