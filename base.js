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
