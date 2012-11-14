cybozu-connect
==============

Cybozu API JavaScript Library

概要
----
cybozu-connect はサイボウズの連携APIにアクセスするための JavaScript ライブラリです。

特徴
----
* サイボウズ(R) Office 8/9 とサイボウズ(R) ガルーン(R) 3/3.5 に対応します。
* SOAP API をラップします。

機能
----
* ベース(Base)
* スケジュール(Schedule)

対応API
-------
* [サイボウズ(R) Office(R) 9 連携API](http://products.cybozu.co.jp/api/) 1.0.0
* [サイボウズ(R) ガルーン(R) 3 連携API](http://g.cybozu.co.jp/construction/api/) 1.0.0

必要システム
------------
* 以下のいずれかのサイボウズ製品
  * [サイボウズ(R) Office(R)](http://products.cybozu.co.jp/office/) Version 8.1.0 以降
  * [サイボウズ(R) ガルーン(R)](http://products.cybozu.co.jp/garoon/) Version 3.0.0 以降
* 以下の JavaScript ライブラリに依存しています。
  * [jQuery](http://jquery.com/) v1.4.1 以降

動作確認済み製品バージョン、およびブラウザ
------------------------------------------
* 製品バージョン
  * サイボウズ Office 9.1
 * サイボウズ ガルーン 3.5
* ブラウザ
  * Internet Explorer 9
  * Firefox 16
  * Google Chrome 23

API リファレンス
----------------
* [API リファレンス](https://github.com/hatashinya/cybozu-connect/wiki)

Cookie認証について
------------------
* CBLabs.CybozuConnect.App.sso() を呼び出してCookie認証を有効にする場合、その後のデータ更新系のAPI呼び出しについては、.exec() ではなく、 .update() を使用するようにしてください。Cookie認証時のデータ更新においてはリクエストトークンが必要となります。.update() ではリクエストトークンのセットを代行してくれます。

セキュリティ
------------
* APIアクセスの度に、ログイン名およびパスワードをプレーンテキストでサーバーに送信しています。セキュリティを確保するためには、SSLをご利用ください。

利用事例
--------
* [Cybozu Advance](http://code.google.com/p/cybozu-advance/)

開発・提供元
------------
[サイボウズ・ラボ株式会社](http://labs.cybozu.co.jp/)

著作権
------
Copyright (C) 2011 [Cybozu Labs, Inc.](http://labs.cybozu.co.jp/)

備考
----
* cybozu-connect はサイボウズの*サポートの対象外*となります。あらかじめご了承ください。
