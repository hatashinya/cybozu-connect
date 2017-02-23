garoon-soap-connecter
==============
#Overview
garoon-soap-connecter はサイボウズガルーンのSOAP APIにアクセスするJavaScript ライブラリです。  
SOAP APIのリクエストやレスポンスをjson形式で取り扱うことができます。

##Desctiption
* Garoon on cybozu.com に対応します。
* SOAP APIの扱えるバージョンであればオンプレ版ガルーンでも動作しますがテストはしていません。
* 下記アプリケーションに対応しています
  * ベース(Base)
  * スケジュール(Schedule)
* SOAP APIリファレンス
  * [Garoon(ガルーン) API](https://cybozudev.zendesk.com/hc/ja/articles/202228424) 
* GSC.CybozuConnect.App.sso() を呼び出してCookie認証を有効にする場合、その後のデータ更新系のAPI呼び出しについては、.exec() ではなく、 .update() を使用するようにしてください。Cookie認証時のデータ更新においてはリクエストトークンが必要となります。.update() ではリクエストトークンのセットを代行してくれます。
* APIアクセスの度に、ログイン名およびパスワードをプレーンテキストでサーバーに送信しています。セキュリティを確保するためには、SSLをご利用ください。

##Requirement
* 以下の JavaScript ライブラリに依存しています。
  * [jQuery](http://jquery.com/) v3.1.1 以降

##Usage
* [リファレンス](https://github.com/north-river/cybozu-connect/wiki)

##VS.
[cybozu-connect](https://github.com/hatashinya/cybozu-connect)との相違点は以下です。
 * kintoneやガルーンカスタマイズ時に利用する想定で、各関数をカスタマイズJSから参照しやすい形に変更しています。（内部的な変更であり利用の仕方自体に変わりはありません。）

##License
MIT License

##Copyriht
Copyright(c) Cybozu, Inc.
