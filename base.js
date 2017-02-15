/*
* cybozu-connect v1.1.3 - Cybozu API JavaScript Library
*
* CBLabs.CybozuConnect.Base class
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

CBLabs.CybozuConnect.Base = function (app) {
    /// <summary>Baseで提供されるAPIを実行するためのクラス</summary>
    /// <param name="app" type="CBLabs.CybozuConnect.App" />
    /// <returns type="CBLabs.CybozuConnect.Base" />
    /// <remarks>
    /// <b>ユーザー情報の属性</b>
    /// <pre>
    /// var user = {
    ///     id: "1",                      // ユーザーID
    ///     key: "1",                     // ユーザーID
    ///     login_name: "sato",           // ログイン名
    ///     name: "佐藤",                 // 名前
    ///     status: 1,                    // ユーザーの使用状況
    ///     email: "sato@example.com",    // E-mail アドレス
    ///     primary_organization_id: "1", // 優先する組織のID
    ///     orgIdList: ["1", "2"]         // 所属する組織のIDの配列
    /// };
    /// </pre>
    /// <b>組織情報の属性</b>
    /// <pre>
    /// var org = {
    ///     id: "1",               // 組織ID
    ///     key: "1",              // 組織ID
    ///     name: "営業部",        // 組織名
    ///     userIdList: ["1", "2"] // 所属するユーザーのIDの配列
    /// };
    /// </pre>
    /// </remarks>

    // private variables
    var userArray, userHash, orgArray, orgHash;
    var hierarchical = null;

    // initialize
    app.Base = this; // set to parent property

    // public methods

    this.isHierarchical = function () {
        /// <summary>組織構造が階層的か否かを返す。</summary>
        /// <returns type="Boolean" />

        if (hierarchical == null) {
            this.organizationList();
        }

        return hierarchical;
    };

    this.userList = function () {
        /// <summary>全ユーザー情報を返す。</summary>
        /// <returns type="Array">ユーザー情報の配列</returns>

        if (userArray) return userArray;

        var res = app.queryItems("Base", "BaseGetUserVersions", "BaseGetUsersById", "user_id", "user_item");
        if (res === false) return null;

        userArray = new Array();
        userHash = new Object();
        if (!res) return userArray;

        $(res.response).find("user").each(function () {
            $this = $(this);
            var userId = $this.attr("key");
            if (!userId) return;

            var user = {
                id: userId,
                key: userId,
                version: $this.attr("version"),
                order: parseInt($this.attr("order"), 10),
                login_name: $this.attr("login_name"),
                name: $this.attr("name"),
                status: $this.attr("status"),
                email: $this.attr("email"),
                primary_organization_id: $this.attr("primary_organization"),
                orgIdList: []
            };

            $this.find("organization").each(function () {
                var orgId = $(this).attr("id");
                if (orgId) {
                    user.orgIdList[user.orgIdList.length] = orgId;
                }
            });

            userArray[userArray.length] = user;
            userHash[userId] = user;
        });

        return userArray;
    };

    this.user = function (userId) {
        /// <summary>指定したユーザーIDのユーザー情報を返す。</summary>
        /// <param name="userId" type="String">ユーザーID</param>
        /// <returns type="Object">ユーザー情報。存在しない場合は null。</returns>

        if (!userId) return null;

        if (userHash) return userHash[userId];

        this.userList();
        if (!userArray) return null;

        if (!userHash) {
            userHash = {};
            for (var i = 0; i < userArray.length; i++) {
                var user = userArray[i];
                userHash[user.id] = user;
            }
        }

        return userHash[userId];
    };

    this.userSearch = function (userText) {
        /// <summary>ユーザー情報を検索する。</summary>
        /// <param name="userText" type="String">検索文字列（ユーザー名、もしくはメールアドレス）</param>
        /// <returns type="Array">ヒットしたユーザー情報の配列</returns>

        this.userList();
        if (!userArray) return null;

        var userResult = new Array();
        for (var i = 0; i < userArray.length; i++) {
            var user = userArray[i];
            if (user.name && user.name.indexOf(userText) >= 0) {
                userResult[userResult.length] = user;
            } else if (user.email && user.email.indexOf(userText) >= 0) {
                userResult[userResult.length] = user;
            }
        }

        return userResult;
    };

    this.organizationList = function () {
        /// <summary>トップレベルの組織情報を返す。</summary>
        /// <returns type="Array">組織情報の配列</returns>

        if (orgArray) return orgArray;

        hierarchical = false;

        var res = app.queryItems("Base", "BaseGetOrganizationVersions", "BaseGetOrganizationsById", "organization_id", "organization_item");
        if (res === false) return null;

        orgArray = new Array();
        orgHash = new Object();
        if (!res) return orgArray;

        $(res.response).find("organization[name]").each(function () {
            $this = $(this);
            var orgId = $this.attr("key");
            if (!orgId) return;

            var org = {
                id: orgId,
                key: orgId,
                name: $this.attr("name"),
                version: $this.attr("version"),
                order: parseInt($this.attr("order"), 10),
                userIdList: []
            };

            // child organization ids
            var childOrg = $this.children("organization");
            if (childOrg.length) {
                org.orgIdList = new Array();
                var j = 0;
                childOrg.each(function () {
                    org.orgIdList[j++] = $(this).attr("key");
                });
                hierarchical = true;
            }

            // member ids
            var j = 0;
            $this.find("user").each(function () {
                var userId = $(this).attr("id");
                if (userId) {
                    org.userIdList[j++] = userId;
                }
            });

            // parent organization id
            var parent_organization_id = $this.attr("parent_organization");
            if (parent_organization_id) {
                org.parent_organization_id = parent_organization_id;
                hierarchical = true;
            } else {
                orgArray[orgArray.length] = org;
            }

            orgHash[orgId] = org;
        });

        return orgArray;
    };

    this.organization = function (orgId) {
        /// <summary>指定した組織IDの組織情報を返す。</summary>
        /// <param name="orgId" type="String">組織ID</param>
        /// <returns type="Object">組織情報</returns>

        if (!orgId) return null;

        if (orgHash) return orgHash[orgId];

        this.organizationList();
        if (!orgArray) return null;

        if (!orgHash) {
            orgHash = {};
            for (var i = 0; i < orgArray.length; i++) {
                var org = orgArray[i];
                orgHash[org.id] = org;
            }
        }

        return orgHash[orgId];
    };

    this.primaryOrganization = function (userId, getFirstIfNotBelong) {
        /// <summary>指定したユーザーの優先する組織を返す。</summary>
        /// <param name="userId" type="String">ユーザーID</param>
        /// <param name="getFirstIfNotBelong">true のとき、指定したユーザーが組織に所属していなかった場合、null ではなく、全組織のうち最初の組織を返す。</param>
        /// <returns type="Object">組織情報</returns>

        if (!userId) return null;

        var user = this.user(userId);
        var org = this.organization(user.primary_organization_id);
        if (org) return org;

        if (user.orgIdList.length) {
            org = this.organization(user.orgIdList[0]);
            if (org) return org;
        }

        if (!getFirstIfNotBelong) return null;

        var orgList = this.organizationList();
        if (orgList && orgList.length) return orgList[0];

        return null;
    };
};

  "request":{
    "id": "100",
    "status": {
      "name": "In progress",
      "type": "IN_PROGRESS"
    },
    "createdAt": "2016-09-28T05:27:45Z",
    "processingStepCode":"$3",
    "name":  "休暇申請（2016年9月28日分）",
    "number": "aaa-1",
    "isUrgent": true,
    "applicant": {
      "code": "sato",
      "name": "佐藤 昇",
      "proxy": {  
        "code": "sato2",
        "name": "佐藤 降"
      }
    },
   "items": {
      "Item1": {
        "name": "Item1 name",
        "type": "SINGLE_LINE_TEXT",
        "value": "foo"
      },
      "Item2": {
        "name": "Item2 name",
        "type": "MULTI_LINE_TEXT",
        "value": "foo"
      },
      "Item3": {
        "name": "Item3 name",
        "type": "DROP_DOWN",
        "value": "foo"
      },
      "Item4": {
        "name": "Item4 name",
        "type": "RADIO_BUTTON",
        "value": "foo"
      },
      "Item5": {
        "name": "Item5 name",
        "type": "CHECK_BOX",
        "value": true
      },
      "Item6": {
        "name": "Item6 name",
        "type": "NUMBER",
        "value": "100"
      },
      "Item7": {
        "name": "Item7 name",
        "type": "CALC",
        "value": "100"
      },
      "Item8": {
        "name": "Item8 name",
        "type": "DATE",
        "value": "2016-09-28"
      },
      "Item9": {
        "name": "Item9 name",
        "type": "DATETIME",
        "value": {
                    "date":"2016-11-12",
                    "time":"14:40"
                 }
      },
      "Item10": {
        "name": "Item10 name",
        "type": "FILE",
        "value": [
          {
             "id": "10",
            "contentType": "text/plain",
            "name": "foo.txt",
            "size": "100"
          },
          {
             "id": "11",
            "contentType": "text/plain",
            "name": "bar.txt",
            "size": "100"
          }
        ]
      },
      "Item11": {
        "name": "Item11 name",
        "type": "ROUTE_NAVI",
        "value": {
          "route": {
            "value": "foo - bar"
          },
          "expense": {
            "value": "100"
          }
        }
      }
    },
    "steps": {
      "Step1": { 
        "id": 15,
        "name": "課長承認", 
        "requrirement": "承認（全員）",
        "isApprovalStep": 1,
        "processors": [
          {
            "code": "matsuda",
            "name": "松田 かんな",
            "result": "Approved",
            "date": "2016-09-28T06:13:15Z",
            "comment": "確認しました。" 
          },
          {
            "code": "takahashi",
            "name": "高橋 健一",
            "result": "Approved",
            "date": "2016-09-28T06:13:15Z",
            "comment": "代理で確認しました。", 
            "proxy": { 
              "code": "yamada",
              "name": "山田 正一"
            }
          }
        ]
      },
      "Step2": { 
        "id": "16",
        "name": "部長承認", 
        "requrirement": "承認（全員）",
        "isApprovalStep": 1,
        "processors": [
          {
            "code": "suzuki",
            "name": "鈴木 孝充"
          },
          {
            "code": "ito",
            "name": "伊東 美咲"
          }
        ]
      },
      "Ack1": { 
        "id": "17",
        "name": "関係者",
        "requrirement": "回覧", 
        "isApprovalStep": 0,
        "processors": [
          {
            "code": "koinuma",
            "name": "鯉沼 正"
          }
        ]
      }
    },
    "availableOperations": {
      "list":["SENT_BACK", "APPROVE", "REJECT"],
      "sentBackTargets": ["$applicant", "Step1", "$2"] 
    },
    "folders": {
      "type": "FOLDER",
      "value": [
        {
          "id": "3",
          "type": "RECEIVED"
        },
        {
          "id": "4",
          "type": "SENT"
        }
      ]
    }
}
}