/*
* cybozu-connect v1.1.3 - Cybozu API JavaScript Library
*
* CBLabs.CybozuConnect.App class
*
* @requires jQuery v1.4.1 or later.
*
* Copyright (C) 2011 Cybozu Labs, Inc.
* http://labs.cybozu.co.jp/
*
* Licensed under the GPL Version 2 license.
*/

var CBLabs = window.CBLabs || new Object;
if (!CBLabs.CybozuConnect) { CBLabs.CybozuConnect = {}; }

CBLabs.CybozuConnect.LicenseError = {
    garoon: { code: "GRN_CBPAPI_63006", message: "ライセンスの有効期限を過ぎています。" },
    office: { code: "19107", message: "ライセンスの有効期限を過ぎています。" }
};

CBLabs.CybozuConnect.App = function (url, username, password) {
    /// <summary>サイボウズ Office 8/ガルーン 3 連携 API を実行するためのクラス</summary>
    /// <param name="url" type="String">アクセス先のURL。URlは ag.exe(cgi) または grn.exe(cgi) で終わる必要がある。</param>
    /// <param name="username" type="String">省略可。username と password を指定した場合、クラス生成時に auth を実行する。</param>
    /// <param name="password" type="String">省略可。username と password を指定した場合、クラス生成時に auth を実行する。</param>
    /// <returns type="CBLabs.CybozuConnect.App" />

    var CybozuType = { Office: "Office", Garoon: "Garoon", GaroonCloud: "GaroonCloud" };

    // private variables
    var _cybozuURL = url;
    var cybozuUsername;
    var cybozuPassword;
    var _cybozuType;
    var _isCloud = false;
    var requestToken;

    // public variables

    this.error;
    /// <value type="Object">直前のエラー情報</value>

    this.user;
    /// <value type="Object">認証を行ったユーザー情報</value>

    this.userId;
    /// <value type="String">認証を行ったユーザーのID</value>

    this.debug = false;
    /// <value type="Boolean">デバッグモードか否か</value>

    // initialize service URL
    if (_cybozuURL.indexOf("/ag.") >= 0) {
        _cybozuType = CybozuType.Office;
        isCloud = (_cybozuURL.indexOf(".cybozu.com/o/") >= 0);
    } else if (_cybozuURL.indexOf("/grn.") >= 0) {
        _cybozuType = CybozuType.Garoon;
    } else if (_cybozuURL.indexOf(".cybozu.com/g/") >= 0) {
        _cybozuType = CybozuType.GaroonCloud;
        isCloud = true;
    } else {
        alert("API が利用できません。");
    }
    if (_cybozuURL.charAt(_cybozuURL.length - 1) == "?") {
        _cybozuURL = _cybozuURL.substr(0, _cybozuURL.length - 1);
    }

    // public methods

    this.cybozuURL = function () { return _cybozuURL; };
    this.cybozuType = function () { return _cybozuType; };
    this.isCloud = function () { return _isCloud; };

    this.auth = function (username, password) {
        /// <summary> APIに対して認証を行う。auth 実行後、query, exec を呼び出すことができる。</summary>
        /// <param name="username" type="String">ログイン名</param>
        /// <param name="password" type="String">パスワード</param>
        /// <returns type="Boolean">true: 成功、false: 失敗</returns>

        cybozuUsername = username;
        cybozuPassword = password;
        var res = this.query("Base", "BaseGetUsersByLoginName", { login_name: { innerValue: cybozuUsername} });
        if (res.error) {
            cybozuUsername = cybozuPassword = null;

        } else {
            var user = $(res.response).find("user");
            if (user.length) {
                this.user = {
                    id: user.attr("key"),
                    key: user.attr("key"),
                    login_name: user.attr("login_name"),
                    name: user.attr("name"),
                    status: user.attr("status"),
                    email: user.attr("email"),
                    primary_organization_id: user.attr("primary_organization")
                };
                this.userId = this.user.id;
                return true;

            } else {
                cybozuUsername = cybozuPassword = null;
            }
        }

        return false;
    };

    this.clearAuth = function () {
        /// <summary>認証をクリアする。再度 auth を実行しない限り、query, exec を呼び出すことはできなくなる。</summary>

        cybozuUsername = cybozuPassword = null;
        this.user = this.userId = null;
    };

    // authentication
    if (username && password) {
        this.auth(username, password);
    }

    this.sso = function () {
        /// <summary>Cookie認証を有効にする。</summary>
        var res = this.query("Util", "UtilGetLoginUserId", null);
        if (res.error) return false;
        var user_id = $(res.response).find("user_id");
        if (user_id.length == 0) return false;
        var userId = user_id.text();

        res = this.query("Base", "BaseGetUsersById", { user_id: { innerValue: userId} });
        if (res.error) return false;
        var user = $(res.response).find("user");
        if (user.length == 0) return false;
        this.user = {
            id: user.attr("key"),
            key: user.attr("key"),
            login_name: user.attr("login_name"),
            name: user.attr("name"),
            status: user.attr("status"),
            email: user.attr("email"),
            primary_organization_id: user.attr("primary_organization")
        };
        this.userId = this.user.id;

        requestToken = this.getRequestToken();
        if (!requestToken) {
            this.user = null;
            this.userId = null;
            return false;
        }

        return true;
    };

    this.isSSO = function () {
        /// <summary>Cookie認証が有効化どうかを返す。</summary>
        return requestToken ? true : false;
    };

    this.getRequestToken = function () {
        /// <summary>リクエストトークンを返す。</summary>
        var res = this.query("Util", "UtilGetRequestToken", null);
        if (res.error) return null;
        var token = $(res.response).find("request_token");
        if (token.length == 0) return null;
        return token.text();
    };

    this.query = function (service, method, params, alertIfError, debug) {
        /// <summary>APIのうち、データ取得系についてのみ実行する。誤ってデータを更新することを防ぐことができる。引数と戻り値は exec と同様。</summary>

        if (method.indexOf(service + "Get") != 0 && method.indexOf(service + "Search") != 0) {
            this.error = { message: "query() メソッドで更新系APIを実行することはできません。" };
            if (alertIfError) {
                alert(this.error.message);
            }
            return { error: this.error };
        }

        return this.exec(service, method, params, alertIfError, debug);
    };

    this.update = function (service, method, params, alertIfError, debug) {
        /// <summary>APIのうち、データ更新系についてのみ実行する。Cookie認証が有効のときデータ更新系ではリクエストトークンが必要となるが、このAPIではリクエストトークンのセットを代行する。</summary>
        if (this.isSSO()) {/*
            var token = this.getRequestToken();
            if (!token) {
                this.error = { message: "データ更新用チケットを取得することができませんでした。" };
                if (alertIfError) {
                    alert(this.error.message);
                }
                return { error: this.error };
            }*/
            var newParams = { request_token: { innerValue: requestToken} };
            for (var key in params) {
                newParams[key] = params[key];
            }
            params = newParams;
            //params.request_token = { innerValue: token };
        }

        return this.exec(service, method, params, alertIfError, debug);
    };

    this.exec = function (service, method, params, alertIfError, debug) {
        /// <summary>APIを実行する。</summary>
        /// <param name="service" type="String">アプリケーション識別子 (Base/Schedule/...)</param>
        /// <param name="method" type="String">API名</param>
        /// <param name="params" type="Object">APIへのパラメータ</param>
        /// <param name="alertIfError" type="Boolean">true のとき、API実行時にエラーが出た場合、アラートボックスを表示する。</param>
        /// <param name="debug" type="Boolean">true のとき、デバッグモードになり、APIへのリクエストおよびレスポンスのXMLの内容が、アラートボックスに表示される。</param>
        /// <returns type="Object">(obj).response にAPIからの戻り値のXMLが入る。エラーの場合 (obj).error.code にエラーコード、(obj).error.message にエラーメッセージが入る。</returns>

        // timestamp
        var time = (new Date()).getTime();
        var created = $.cybozuConnect.formatISO8601(time, false);
        time += 1000;
        var expires = $.cybozuConnect.formatISO8601(time, false);

        // request
        method = $.cybozuConnect.xmlEscape(method);
        var requestXml = '<?xml version="1.0" encoding="utf-8"?>\
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">\
  <soap:Header>\
    <Action soap:mustUnderstand="1" xmlns="http://schemas.xmlsoap.org/ws/2003/03/addressing">' + method + '</Action>\
    <Timestamp soap:mustUnderstande="1" xmlns="http://schemas.xmlsoap.org/ws/2002/07/utility">\
      <Created>' + created + '</Created>\
      <Expires>' + expires + '</Expires>\
    </Timestamp>';
        if (cybozuUsername) {
            requestXml += '<Security xmlns:wsu="http://schemas.xmlsoap.org/ws/2002/07/utility" soap:mustUnderstand="1" xmlns="http://schemas.xmlsoap.org/ws/2002/12/secext">\
      <UsernameToken>\
        <Username>' + $.cybozuConnect.xmlEscape(cybozuUsername) + '</Username>\
        <Password>' + $.cybozuConnect.xmlEscape(cybozuPassword) + '</Password>\
      </UsernameToken>\
    </Security>';
        }
        requestXml += '</soap:Header>\
  <soap:Body>\
    <' + method + ' xmlns="http://wsdl.cybozu.co.jp/base/2008">';
        requestXml += makeParametersXml("parameters", params);
        requestXml += '</' + method + '></soap:Body></soap:Envelope>';

        if (debug || this.debug) {
            alert(requestXml);
        }

        // call API
        var req = new XMLHttpRequest;
        var url = _cybozuURL;
        switch (_cybozuType) {
            case CybozuType.Office:
                url += "?page=PApi" + service;
                break;
            case CybozuType.Garoon:
            case CybozuType.GaroonCloud:
                var top = "cbpapi";
                if (service == "Admin") {
                    top = "sysapi";
                } else if (service == "Util") {
                    top = "util_api";
                }
                if (_cybozuType == CybozuType.Garoon) {
                    url += "/" + top + "/" + service.toLowerCase() + "/api";
                } else {
                    url += top + "/" + service.toLowerCase() + "/api.csp?";
                }
                break;
            default:
                throw "Unexpected";
                return;
        }
        req.open("POST", url, false);
        req.setRequestHeader("Content-Type", 'application/soap+xml; charset=utf-8; action="' + method + '"');
        req.send(requestXml);
        var res;
        if (req.status == 200 || req.responseText) {
            if (debug || this.debug) {
                alert(req.responseText);
            }
            var dom = null;
            if (req.responseXml) {
                dom = req.responseXml;
            } else if (req.responseText.indexOf("<?xml") == 0) {
                dom = $.cybozuConnect.xmlDom(req.responseText);
            }
            if (dom != null) {
                //var error = $(dom).find("soap:Detail");
                var $dom = $(dom);
                var code = $dom.find("code");
                var diagnosis = $dom.find("diagnosis");
                if (code.length > 0 && diagnosis.length > 0) {
                    this.error = { code: code.text(), message: diagnosis.text(), cause: $dom.find("cause").text(), counter_measure: $dom.find("counter_measure").text() };
                    res = { response: dom, error: this.error };
                } else {
                    this.error = null;
                    res = { response: dom };
                }
            } else {
                if (req.responseText.indexOf(CBLabs.CybozuConnect.LicenseError.garoon.code) >= 0) {
                    this.error = CBLabs.CybozuConnect.LicenseError.garoon;
                } else {
                    this.error = { message: "予期せぬエラー" };
                }
                res = { response: dom, error: this.error };
            }

            if (debug || this.debug) {
                res.responseText = req.responseText;
            }
        } else {
            this.error = { message: "通信エラー" };
            res = { error: this.error };
        }

        if (alertIfError && this.error) {
            alert(this.error.message);
        }

        return res;
    };

    this.queryItems = function (service, methodOfGetVersions, methodOfGetById, idName, itemName) {
        var params = {};
        params[idName] = new Array();

        // get item versions
        var res = this.query(service, methodOfGetVersions, null, true);
        if (res.error) return false;

        // make item id list
        var i = 0;
        $(res.response).find(itemName).each(function () {
            var id = $(this).attr("id");
            if (id) {
                params[idName][i++] = { innerValue: id };
            }
        });
        if (params[idName].length == 0) return null;

        // get item list
        res = this.query(service, methodOfGetById, params, true);
        if (res.error) return false;

        return res;
    };

    // private functions

    function makeParametersXml(name, child) {
        if (!child || !$.isPlainObject(child)) return "<" + name + " />";

        var xml = "<" + name;
        var attributesEnded = false;
        if (name == "parameters") {
            xml += ' xmlns=""';
        }
        for (var key in child) {
            var value = child[key];
            if (value == null) {
                // do noting

            } else if ($.isPlainObject(value)) {
                if (!attributesEnded) {
                    attributesEnded = true;
                    xml += ">";
                }
                xml += makeParametersXml(key, value);

            } else if ($.isArray(value)) {
                if (!attributesEnded) {
                    attributesEnded = true;
                    xml += ">";
                }
                for (var i = 0; i < value.length; i++) {
                    if (!$.isPlainObject(value[i])) continue;
                    xml += makeParametersXml(key, value[i]);
                }
            } else if (key == "innerValue") {
                // inner value
                if (!attributesEnded) {
                    attributesEnded = true;
                    xml += ">"
                }
                xml += $.cybozuConnect.htmlEscape(value);
                break;

            } else if (!attributesEnded) {
                // attribute
                var type = typeof value;
                if (type == "string") {
                    if (value.indexOf("\n") >= 0) {
                        xml += " " + key + '="' + $.cybozuConnect.xmlAttributeEscape(value) + '"';
                    } else {
                        xml += " " + key + '="' + $.cybozuConnect.htmlEscape(value) + '"';
                    }
                } else if (type == "number" || type == "boolean") {
                    xml += " " + key + '="' + value + '"';
                }

            } else {
                // attributes are ended
            }
        }
        if (!attributesEnded) xml += ">";
        xml += "</" + name + ">";
        return xml;
    }
};
