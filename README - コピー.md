cybozu-connect
==============

Cybozu API JavaScript Library

General
----
garoon-soap-connect はサイボウズガルーンのSOAP APIにアクセスするJavaScript ライブラリです。

更新情報
--------

特徴
----
* Garoon on cybozu.com に対応します。
* SOAP APIの扱えるバージョンであればオンプレ版ガルーンでも動作しますがテストはしていません。

機能
----
* ベース(Base)
* スケジュール(Schedule)

対応API
-------
* [Garoon(ガルーン) API](https://cybozudev.zendesk.com/hc/ja/articles/202228424) 

必要なライブラリ
------------
* 以下の JavaScript ライブラリに依存しています。
  * [jQuery](http://jquery.com/) v3.1.1 以降

動作確認済み製品バージョン、およびブラウザ
------------------------------------------
* 製品バージョン
 * Garoon on cybozu.com
* ブラウザ
  * Internet Explorer 11
  * Firefox 
  * Google Chrome 

API リファレンス
----------------
* [API リファレンス](https://github.com/north-river/cybozu-connect/wiki)

Cookie認証について
------------------
* CBLabs.CybozuConnect.App.sso() を呼び出してCookie認証を有効にする場合、その後のデータ更新系のAPI呼び出しについては、.exec() ではなく、 .update() を使用するようにしてください。Cookie認証時のデータ更新においてはリクエストトークンが必要となります。.update() ではリクエストトークンのセットを代行してくれます。

セキュリティ
------------
* APIアクセスの度に、ログイン名およびパスワードをプレーンテキストでサーバーに送信しています。セキュリティを確保するためには、SSLをご利用ください。

Usage
--------
* [Cybozu Advance](http://code.google.com/p/cybozu-advance/)

License
------
MIT License

Copyriht
----
Copyright(c) Cybozu, Inc.
