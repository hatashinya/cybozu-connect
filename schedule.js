/*
* cybozu-connect v1.1.3 - Cybozu API JavaScript Library
*
* CBLabs.CybozuConnect.Schedule class
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

CBLabs.CybozuConnect.SchedulePersonalProfile = function (res) {
    /// <summary>スケジュールの個人設定を表すクラス</summary>
    /// <param name="res" type="Object">APIからのレスポンス</param>
    /// <returns type="CBLabs.CybozuConnect.SchedulePersonalProfile" />

    var profile = $(res.response).find("personal_profile");
    var plan_menu;

    this.plan_menu = function () {
        /// <summary>予定メニュー</summary>
        /// <returns type="Array">予定メニュー項目の配列</returns>

        if (plan_menu) return plan_menu;

        var value = profile.attr("plan_menu");
        if (value) {
            plan_menu = value.split("\n");
            for (var i = plan_menu.length - 1; i >= 0; i--) {
                if (plan_menu[i]) break;
                plan_menu.pop();
            }
        } else {
            plan_menu = new Array();
        }

        return plan_menu;
    };
};

CBLabs.CybozuConnect.ScheduleSystemProfile = function (res) {
    /// <summary>スケジュールのシステム設定を表すクラス</summary>
    /// <param name="res" type="Object">APIからのレスポンス</param>
    /// <returns type="CBLabs.CybozuConnect.ScheduleSystemProfile" />

    var profile = $(res.response).find("system_profile");
    var plan_menu = null;
    var show_group_event = null;

    this.plan_menu = function () {
        /// <summary>予定メニュー</summary>
        /// <returns type="Array">予定メニュー項目の配列</returns>

        if (plan_menu != null) return plan_menu;

        var value = profile.attr("plan_menu");
        if (value) {
            plan_menu = value.split("\n");
            for (var i = plan_menu.length - 1; i >= 0; i--) {
                if (plan_menu[i]) break;
                plan_menu.pop();
            }
        } else {
            plan_menu = new Array();
        }

        return plan_menu;
    };

    this.show_group_event = function () {
        /// <summary>グループの予定を表示するか否か</summary>
        /// <returns type="Boolean" />

        if (show_group_event == null) {
            show_group_event = (profile.attr("show_group_event") != "false");
        }
        return show_group_event;
    }
};

CBLabs.CybozuConnect.Schedule = function (app) {
    /// <summary>Scheduleで提供されるAPIを実行するクラス</summary>
    /// <param name="app" type="CBLabs.CybozuConnect.App" />
    /// <returns type="CBLabs.CybozuConnect.Schedule" />
    /// <remarks>
    /// <b>予定を取得する期間の指定について</b>
    ///
    /// 例えば 2011-01-16 から 2011/01/22 までの予定を取得する場合、
    /// 開始日時として 2011-01-16 00:00:00 を指定し、
    /// 終了日時として 2011-01-23 00:00:00 を指定する。
    ///
    /// <b>予定情報の属性</b>
    /// <pre>
    /// var event = {
    ///     id: "1",                             // 予定ID
    ///     allDay: false,                       // 終日予定（バナー予定を含む）か否か
    ///     start: new Date(2011, 0, 28, 10, 0), // 開始日時
    ///     end: new Date(2011, 0, 28, 11, 0),   // 終了日時
    ///     event_type: "repeat",                // 予定の種類
    ///     public_type: "public",               // 公開方法（"public": 公開、"private": 非公開）
    ///     plan: "会議",                        // 予定メニュー
    ///     detail: "進捗",                      // 予定詳細
    ///     title: "会議:進捗",                  // 予定メニュー＋予定詳細
    ///     description: "要議事録",             // メモ
    ///     timezone: "Asia/Tokyo",              // タイムゾーン
    ///     start_only: false,                   // 開始時刻のみ設定されているか否か
    ///     users: [],                           // 参加するユーザーの配列（予定取得時）
    ///     organizations: [],                   // 参加する組織の配列（予定取得時）
    ///     facilities: [],                      // 参加する設備の配列（予定取得時）
    ///     userIdList: ["1", "2"],              // 参加するユーザーのIDの配列（予定追加・変更時）
    ///     orgIdList: ["1"],                    // 参加する組織のIDの配列（予定追加・変更時）
    ///     facilityIdList: ["5"],               // 参加する設備のIDの配列（予定追加・変更時）
    ///
    ///     repeatInfo: {                 // 繰り返し情報（繰り返し予定の場合）
    ///         type: "week",             // 繰り返しの種類
    ///         day: "28",                // type=="month" の場合の日指定
    ///         week: "5",                // type=="week"/"1stweek"/"2ndweek"/"3rdweek"/"4thweek"/"lastweek" の場合の曜日指定
    ///         start_date: "2011-01-28", // 繰り返し期間の開始日付（xsd:date）
    ///         end_date: "2011-02-28",   // 繰り返し期間の終了日付（xsd:date）
    ///         start_time: "10:00:00",   // 開始時刻（xsd:time）
    ///         end_time: "11:00:00"      // 終了時刻（xsd:time）
    ///     }
    /// };
    /// </pre>
    ///
    /// <b>予定の種類</b>
    ///
    ///   * "normal": 通常予定
    ///   * "banner": バナー（期間）予定
    ///   * "repeat": 繰り返し予定
    ///   * "temporary": 仮予定
    ///
    /// <b>繰り返しの種類</b>
    ///
    ///   * "day": 毎日
    ///   * "weekday": 平日
    ///   * "week": 毎週
    ///   * "1stweek": 毎月第１何曜日
    ///   * "2ndweek": 毎月第２何曜日
    ///   * "3rdweek": 毎月第３何曜日
    ///   * "4thweek": 毎月第４何曜日
    ///   * "lastweek": 毎月最終何曜日
    ///   * "month": 毎月何日
    ///
    /// <b>設備情報の属性</b>
    /// <pre>
    /// var facility = {
    ///     id: "5",                      // 設備ID
    ///     key: "5",                     // 設備ID
    ///     name: "会議室１",             // 設備名
    ///     description: "",              // メモ
    ///     belong_facility_group_id: "1" // 所属する設備グループ
    /// };
    /// </pre>
    /// <b>設備グループの属性</b>
    /// <pre>
    /// var facilityGroup = {
    ///     id: "1",                       // 設備グループID
    ///     key: "1",                      // 設備グループID
    ///     name: "会議室",                // 設備グループ名
    ///     facilityIdList: ["5"],         // 所属する設備のIDの配列
    ///     parent_facility_group_id: null // 親設備グループ
    /// };
    /// </pre>
    /// </remarks>

    // private variables
    var facilityArray, facilityHash, facilityGroupArray, facilityGroupHash;
    var personalProfile, systemProfile;

    // initialize
    app.Schedule = this; // set to parent property

    // get base
    var Base = app.Base || new CBLabs.CybozuConnect.Base(app);

    this.personalProfile = function () {
        /// <summary>スケジュールの個人設定を返す。</summary>
        /// <returns type="CBLabs.CybozuConnect.SchedulePersonalProfile" />

        if (!personalProfile) loadProfiles();
        return personalProfile;
    };

    this.systemProfile = function () {
        /// <summary>スケジュールのシステム設定を返す。</summary>
        /// <returns type="CBLabs.CybozuConnect.ScheduleSystemProfile" />

        if (!systemProfile) loadProfiles();
        return systemProfile;
    };

    function loadProfiles() {
        var res = app.query("Schedule", "ScheduleGetProfiles", { include_system_profile: true }, true);
        if (res.error) return;

        personalProfile = new CBLabs.CybozuConnect.SchedulePersonalProfile(res);
        systemProfile = new CBLabs.CybozuConnect.ScheduleSystemProfile(res);
    }

    this.getEventsByTarget = function (options) {
        /// <summary>指定した対象の予定を返す。</summary>
        /// <param name="options.start" type="Date">取得する期間の開始日時</param>
        /// <param name="options.end" type="Date">取得する期間の終了日時</param>
        /// <param name="options.userId" type="String">ユーザーID</param>
        /// <param name="options.organizationId" type="String">組織ID</param>
        /// <param name="options.facilityId" type="String">設備ID</param>
        /// <returns type="Array">予定の配列</returns>
        /// <remarks>ユーザーID、組織ID、および設備IDのうち、いずれか１つだけ指定できる。</remarks>

        if (!options.start || !options.end || (!options.userId && !options.organizationId && !options.facilityId)) return null;

        var params = {
            start: $.cybozuConnect.formatXSDDateTime(options.start, false),
            end: $.cybozuConnect.formatXSDDateTime(options.end, false)
        };
        if (options.userId) {
            params.user = { id: options.userId };
        } else if (options.organizationId) {
            params.organization = { id: options.organizationId };
        } else { // options.facilityId
            params.facility = { id: options.facilityId };
        }

        var res = app.query("Schedule", "ScheduleGetEventsByTarget", params, true);
        if (res.error) return null;

        return getEventsFromResponse(res.response, options.start, options.end);
    };

    this.getEvents = function (options) {
        /// <summary>指定した複数の対象の予定を返す。</summary>
        /// <param name="options.start" type="Date">取得する期間の開始日時</param>
        /// <param name="options.end" type="Date">取得する期間の終了日時</param>
        /// <param name="options.userIdList" type="Array">（省略可）ユーザーIDの配列</param>
        /// <param name="options.organizationIdList" type="Array">（省略可）組織IDの配列</param>
        /// <param name="options.facilityIdList" type="Array">（省略可）設備IDの配列</param>
        /// <returns type="Array">予定の配列</returns>

        if (!options.start || !options.end) return null;

        var userIdList = options.userIdList || new Array();
        var orgIdList = options.orgIdList || new Array();
        var facilityIdList = options.facilityIdList || new Array();
        if (userIdList.length + orgIdList.length + facilityIdList.length == 0) return null;

        var events = { organizations: {}, users: {}, facilities: {} };
        for (var i = 0; i < orgIdList.length; i++) {
            var id = orgIdList[i];
            events.organizations[id] = this.getEventsByTarget({ start: options.start, end: options.end, organizationId: id });
        }
        for (var i = 0; i < userIdList.length; i++) {
            var id = userIdList[i];
            events.users[id] = this.getEventsByTarget({ start: options.start, end: options.end, userId: id });
        }
        for (var i = 0; i < facilityIdList.length; i++) {
            var id = facilityIdList[i];
            events.facilities[id] = this.getEventsByTarget({ start: options.start, end: options.end, facilityId: id });
        }
        return events;
    };

    this.addEvent = function (event, visStart, visEnd) {
        /// <summary>予定を追加する。</summary>
        /// <param name="event" type="Object">追加する予定の情報</param>
        /// <param name="visStart" type="Date">（戻り値としての予定を）取得する期間の開始日時</param>
        /// <param name="visEnd" type="Date">（戻り値としての予定を）取得する期間の終了日時</param>
        /// <returns type="Array">追加された予定の配列</returns>

        if (event.userIdList) {
            if (event.userIdList.length + event.orgIdList.length + event.facilityIdList.length == 0) {
                alert("参加者がいません。");
                return null;
            }
        }

        var params = {
            schedule_event: {
                xmlns: "",
                id: "dummy",
                event_type: event.event_type,
                version: "dummy",
                public_type: "public",
                plan: event.plan,
                detail: event.detail,
                description: event.description,
                allday: String(event.allDay)
            }
        };

        // members
        params.schedule_event.members = prepareMembers(event);

        if (event.event_type == "repeat") {
            // repeat_info
            params.schedule_event.repeat_info = {
                condition: {
                    type: event.repeatInfo.type,
                    day: event.repeatInfo.day,
                    week: event.repeatInfo.week,
                    start_date: event.repeatInfo.start_date
                }
            };
            if (event.repeatInfo.end_date) {
                params.schedule_event.repeat_info.condition.end_date = event.repeatInfo.end_date;
            }
            if (!event.allDay) {
                params.schedule_event.repeat_info.condition.start_time = event.repeatInfo.start_time;
                if (event.repeatInfo.end_time) {
                    params.schedule_event.repeat_info.condition.end_time = event.repeatInfo.end_time;
                }
                // start_only
                params.schedule_event.start_only = (!event.repeatInfo.end_time);
            }
        } else {
            // start_only
            params.schedule_event.start_only = (!event.end);

            // when
            params.schedule_event.when = createWhen(event);
        }

        var res = app.update("Schedule", "ScheduleAddEvents", params, true);
        if (res.error) return null;

        if (!visStart || !visEnd) {
            return $(res.response).find("schedule_evnet").length > 0;
        }

        return getEventsFromResponse(res.response, visStart, visEnd);
    };

    this.modifyEvent = function (event) {
        /// <summary>（繰り返し以外の）予定を変更する。</summary>
        /// <param name="event" type="Object">変更する予定の情報</param>
        /// <returns type="Boolean">true: 成功、false: 失敗</returns>

        if (event.event_type == "repeat") {
            alert("このメソッドでは、繰り返し予定は変更できません。");
            return false;
        }

        if (event.userIdList) {
            if (event.userIdList.length + event.orgIdList.length + event.facilityIdList.length == 0) {
                alert("参加者がいません。");
                return false;
            }
        }

        // members
        var members = prepareMembers(event);

        // when
        var when = createWhen(event);

        var params = {
            schedule_event: {
                xmlns: "",
                id: event.id,
                event_type: event.event_type,
                version: event.version,
                public_type: event.public_type,
                allday: event.allDay,
                start_only: (!event.end),
                plan: event.plan,
                detail: event.detail,
                description: event.description,
                members: members,
                when: when
            }
        };

        var res = app.update("Schedule", "ScheduleModifyEvents", params, true);
        if (res.error) return false;

        return $(res.response).find("schedule_event").length > 0;
    };

    this.modifyRepeatEvent = function (event, modifyType, baseDate, modifyDate) {
        /// <summary>繰り返し予定を変更する。</summary>
        /// <param name="event" type="Object">変更する予定の情報</param>
        /// <param name="modifyType" type="String">変更する範囲（"this": baseDate で指定した日付のみ、"after": baseDate 以降について、"all": すべて）</param>
        /// <param name="baseDate" type="Date">変更する範囲の基準日付（modifyType の項を参照）</param>
        /// <param name="modifyDate" type="Date">modifyType=="this" のとき、変更先の日付。modifyType=="after" のとき、変更後予定の繰り返し期間の開始日付。</param>
        /// <returns type="Boolean">true: 成功、false: 失敗</returns>

        if (event.event_type != "repeat") {
            alert("このメソッドでは、繰り返し予定のみ変更できます。");
            return false;
        }

        if (modifyType == "this" && !$.cybozuConnect.equalDate(baseDate, modifyDate)) {
            if (event.allDay) {
                event.start = event.end = modifyDate;
            } else {
                var xsdModifyDate = $.cybozuConnect.formatXSDDate(modifyDate);
                event.start = $.cybozuConnect.parseXSDDateTime(xsdModifyDate + "T" + event.repeatInfo.start_time);
                if (event.repeatInfo.end_time) {
                    event.end = $.cybozuConnect.parseXSDDateTime(xsdModifyDate + "T" + event.repeatInfo.end_time);
                }
            }
            var eventId = event.id; // save
            event.event_type = "normal";
            var visStart = new Date(modifyDate);
            var visEnd = $.cybozuConnect.incDate(visStart);
            var events = this.addEvent(event, visStart, visEnd);
            if (!events || !events.length) return false;

            if (!this.removeEventFromRepeatEvent(eventId, "this", baseDate)) {
                this.removeEvent(events[0].id);
                return false;
            } else {
                return true;
            }
        } else if (modifyType == "after" && $.cybozuConnect.compareDate(baseDate, modifyDate) > 0) {
            var eventId = event.id; // save
            var visStart = new Date(modifyDate);
            var visEnd = $.cybozuConnect.incDate(visStart);
            var events = this.addEvent(event, visStart, visEnd);
            if (!events) return false;

            if (!this.removeEventFromRepeatEvent(eventId, "after", baseDate)) {
                if (events.length) {
                    this.removeEventFromRepeatEvent(events[0].id, "all", null);
                }
                return false;
            } else {
                return true;
            }
        } else if (modifyType == "after" && $.cybozuConnect.compareDate(baseDate, modifyDate) != 0) {
            event.repeatInfo.start_date = $.cybozuConnect.formatXSDDate(baseDate);
        }

        if (event.userIdList) {
            if (event.userIdList.length + event.orgIdList.length + event.facilityIdList.length == 0) {
                alert("参加者がいません。");
                return false;
            }
        }

        // members
        var members = prepareMembers(event);
        var operation = { type: modifyType };
        var schedule_event = {
            xmlns: "",
            id: event.id,
            event_type: event.event_type,
            version: event.version,
            public_type: event.public_type,
            allday: event.allDay,
            start_only: event.start_only,
            plan: event.plan,
            detail: event.detail,
            description: event.description,
            members: members
        };

        if (modifyType == "this" || modifyType == "after") {
            operation.date = $.cybozuConnect.formatXSDDate(baseDate);
        }

        schedule_event.repeat_info = {
            condition: {
                type: event.repeatInfo.type,
                day: event.repeatInfo.day,
                week: event.repeatInfo.week,
                start_date: event.repeatInfo.start_date
            }
        };

        if (event.repeatInfo.end_date) {
            schedule_event.repeat_info.condition.end_date = event.repeatInfo.end_date;
        }
        if (!event.allDay) {
            schedule_event.repeat_info.condition.start_time = event.repeatInfo.start_time;
            if (event.repeatInfo.end_time) {
                schedule_event.repeat_info.condition.end_time = event.repeatInfo.end_time;
            }
            // start_only
            schedule_event.start_only = (!event.repeatInfo.end_time);
        }

        operation.schedule_event = schedule_event;
        var params = { operation: operation };

        var res = app.update("Schedule", "ScheduleModifyRepeatEvents", params, true);
        if (res.error) return false;

        return $(res.response).find("result").length > 0;
    };

    function prepareMembers(event) {
        var memberList = new Array();
        if (event.userIdList) {
            for (var i = 0; i < event.userIdList.length; i++) {
                memberList[memberList.length] = { user: { id: event.userIdList[i]} };
            }
            for (var i = 0; i < event.orgIdList.length; i++) {
                memberList[memberList.length] = { organization: { id: event.orgIdList[i]} };
            }
            for (var i = 0; i < event.facilityIdList.length; i++) {
                memberList[memberList.length] = { facility: { id: event.facilityIdList[i]} };
            }
        } else if (event.users) {
            for (var i = 0; i < event.users.length; i++) {
                var user = event.users[i];
                memberList[memberList.length] = { user: { id: user.id, order: user.order} };
            }
            for (var i = 0; i < event.organizations.length; i++) {
                var org = event.organizations[i];
                memberList[memberList.length] = { organization: { id: org.id, order: org.order} };
            }
            for (var i = 0; i < event.facilities.length; i++) {
                var facility = event.facilities[i];
                memberList[memberList.length] = { facility: { id: facility.id, order: facility.order} };
            }
        } else {
            // unexpected
        }
        return { member: memberList };
    }

    this.removeEvent = function (eventId) {
        /// <summary>（繰り返し以外の）予定を削除する。</summary>
        /// <param name="eventId" type="String">予定ID</param>
        /// <return type="Boolean" />true: 成功、false: 失敗</returns>

        var res = app.update("Schedule", "ScheduleRemoveEvents", { event_id: { innerValue: eventId} }, true);
        return res.error ? false : true;
    };

    this.removeEventFromRepeatEvent = function (eventId, type, date) {
        /// <summary>繰り返し予定を削除する。</summary>
        /// <param name="eventId" type="String">予定ID</param>
        /// <param name="type" type="String">削除する範囲（"this"/"after"/"all"）</param>
        /// <param name="date" type="Date">削除する範囲の基準日付</param>
        /// <return type="Boolean" />true: 成功、false: 失敗</returns>

        var params = { operation: { event_id: eventId, type: type} };
        if (type == "this" || type == "after") {
            params.operation.date = $.cybozuConnect.formatXSDDate(date);
        }
        var res = app.update("Schedule", "ScheduleRemoveEventsFromRepeatEvent", params, true);
        return res.error ? false : true;
    };

    this.leaveEvent = function (eventId) {
        /// <summary>（繰り返し以外の）予定から抜ける。</summary>
        /// <param name="eventId" type="String">予定ID</param>
        /// <return type="Boolean" />true: 成功、false: 失敗</returns>

        var res = app.update("Schedule", "ScheduleLeaveEvents", { event_id: { innerValue: eventId} }, true);
        return res.error ? false : true;
    };

    this.leaveEventFromRepeatEvent = function (eventId, type, date) {
        /// <summary>繰り返し予定から抜ける。</summary>
        /// <param name="eventId" type="String">予定ID</param>
        /// <param name="type" type="String">抜ける範囲（"this"/"after"/"all"）</param>
        /// <param name="date" type="Date">抜ける範囲の基準日付</param>
        /// <return type="Boolean" />true: 成功、false: 失敗</returns>

        var params = { operation: { event_id: eventId, type: type} };
        if (type == "this" || type == "after") {
            params.operation.date = $.cybozuConnect.formatXSDDate(date);
        }
        var res = app.update("Schedule", "ScheduleLeaveEventsFromRepeatEvent", params, true);
        return res.error ? false : true;
    };

    this.addFollow = function (event, followText) {
        /// <summary>フォローを予定に追加する。</summary>
        /// <param name="event" type="Object/String">フォローを追加する先の予定、または予定ID</param>
        /// <param name="followText" type="String">フォロー内容</param>
        /// <returns type="Object">フォローが追加された予定</returns>

        var event_id;
        if ($.isPlainObject(event)) {
            if (event.event_type == "repeat") {
                alert("このメソッドでは、繰り返し予定にフォローを追加できません。");
                return null;
            }
            event_id = event.id;
        } else {
            event_id = event;
        }

        var events = this.addFollows({ event_id: event_id, content: followText });
        if ($.isArray(events) && events.length) return events[0];

        return null;
    };

    this.addFollows = function (follows) {
        /// <summary>フォローを予定に追加する。</summary>
        /// <param name="follows" type="Object/Array">フォロー（の配列）</param>
        /// <param name="visStart" type="Date">（省略可）（戻り値としての予定を）取得する期間の開始日時</param>
        /// <param name="visEnd" type="Date">（省略可）（戻り値としての予定を）取得する期間の終了日時</param>
        /// <returns type="Array">フォローが追加された予定の配列</returns>

        var params = {};
        if (!$.isPlainObject(follows) && $.isArray(follows)) {
            throw "'follows' must be a plain object or a array.";
        }
        params.follow = follows;
        var res = app.update("Schedule", "ScheduleAddFollows", params, true);
        if (res.error) return null;

        return getEventsFromResponse(res.response, null, null);
    };

    this.addFollowToRepeatEvent = function (event, date, followText) {
        /// <summary>フォローを繰り返し予定に追加する。</summary>
        /// <param name="event" type="Object/String">フォローを追加する先の予定、または予定ID</param>
        /// <param name="date" type="Date">フォローを追加する先の予定の日付</param>
        /// <param name="followText" type="String">フォロー内容</param>
        /// <return type="Boolean" />true: 成功、false: 失敗</returns>

        var event_id;
        if ($.isPlainObject(event)) {
            if (event.event_type != "repeat") {
                alert("このメソッドでは、繰り返し予定以外にフォローを追加できません。");
                return null;
            }
            event_id = event.id;
        } else {
            event_id = event;
        }

        var events = this.addFollowsToRepeatEvent({ event_id: event_id, date: $.cybozuConnect.formatXSDDate(date), content: followText });
        if ($.isArray(events) && events.length) return events[0];

        return null;
    };

    this.addFollowsToRepeatEvent = function (follows) {
        /// <summary>フォローを繰り返し予定に追加する。</summary>
        /// <param name="follows" type="Object/Array">フォロー（の配列）</param>
        /// <param name="visStart" type="Date">（省略可）（戻り値としての予定を）取得する期間の開始日時</param>
        /// <param name="visEnd" type="Date">（省略可）（戻り値としての予定を）取得する期間の終了日時</param>
        /// <return type="Boolean" />true: 成功、false: 失敗</returns>

        var params = {};
        if (!$.isPlainObject(follows) && $.isArray(follows)) {
            throw "'follows' must be a plain object or a array.";
        }
        params.follow = follows;
        var res = app.update("Schedule", "ScheduleAddFollowsToRepeatEvent", params, true);
        if (res.error) return false;

        return getEventsFromResponse(res.response, null, null, "modified");
    };

    this.removeFollows = function (followIds) {
        /// <summary>フォローを削除する。</summary>
        /// <param name="followIds" type="String/Array">フォローID（の配列）</param>
        /// <return type="Boolean" />true: 成功、false: 失敗</returns>

        var params = {};
        if ($.isArray(followIds)) {
            params.follow_id = new Array();
            for (var i = 0; i < followIds.length; i++) {
                params.follow_id[params.follow_id.length] = { innerValue: followIds[i] };
            }
        } else {
            params.follow_id = { innerValue: followIds };
        }

        var res = app.update("Schedule", "ScheduleRemoveFollows", params, true);
        return res.error ? false : true;
    };

    this.inMembers = function (userId, event) {
        /// <summary>指定したユーザーが予定の参加者に含まれるか否か</summary>
        /// <param name="userId" type="String">ユーザーID</param>
        /// <param name="event" type="Object">予定</param>
        /// <returns type="Boolean" />

        for (var i = 0; i < event.users.length; i++) {
            var user = event.users[i];
            if (user.id == userId) return true;
        }
        return false;
    };

    var hierarchical = null;

    this.isHierarchical = function () {
        /// <summary>設備グループが階層的か否か</summary>
        /// <returns type="Boolean" />

        if (hierarchical == null) {
            this.facilityGroupList();
        }

        return hierarchical;
    };

    this.facilityList = function () {
        /// <summary>全設備を取得する。</summary>
        /// <returns type="Array">設備の配列</returns>

        if (facilityArray) return facilityArray;

        var res = app.queryItems("Schedule", "ScheduleGetFacilityVersions", "ScheduleGetFacilitiesById", "facility_id", "facility_item");
        if (res === false) return null;

        facilityArray = new Array();
        facilityHash = new Object();
        if (!res) return facilityArray;

        $(res.response).find("facility").each(function () {
            $this = $(this);
            var id = $this.attr("key");
            if (!id) return;

            facilityHash[id] = {
                id: id,
                key: id,
                version: $this.attr("version"),
                order: $this.attr("order"),
                name: $this.attr("name"),
                description: $this.attr("description"),
                belong_facility_group_id: $this.attr("belong_facility_group")
            };
        });

        for (var key in facilityHash) {
            facilityArray[facilityArray.length] = facilityHash[key];
        }

        return facilityArray;
    };

    this.facility = function (facilityId) {
        /// <summary>指定した設備の情報を取得する</summary>
        /// <param name="facilityId" type="String">設備ID</param>
        /// <returns type="Object">設備情報</returns>

        if (!facilityId) return null;

        if (!facilityHash) {
            if (this.facilityList() === false) return null;
        }

        return facilityHash[facilityId];
    };

    this.facilitySearch = function (text) {
        /// <summary>設備を検索する</summary>
        /// <param name="text" type="String">検索文字列</param>
        /// <returns type="Array">ヒットした設備情報の配列</returns>

        this.facilityList();
        if (!facilityArray) return null;

        var facilityResult = new Array();
        for (var i = 0; i < facilityArray.length; i++) {
            var facility = facilityArray[i];
            if (facility.name && facility.name.indexOf(text) >= 0) {
                facilityResult[facilityResult.length] = facility;
            } else if (facility.description && facility.description.indexOf(text) >= 0) {
                facilityResult[faciuserResult.length] = facility;
            }
        }

        return facilityResult;
    };

    this.facilityGroupList = function () {
        /// <summary>トップレベルの設備グループを返す</summary>
        /// <returns type="Array">設備グループ情報の配列</returns>

        if (facilityGroupArray) return facilityGroupArray;

        var res = app.queryItems("Schedule", "ScheduleGetFacilityGroupsVersions", "ScheduleGetFacilityGroupsById", "facility_group_id", "facility_group_item");
        if (res === false) return null;

        facilityGroupArray = new Array();
        facilityGroupHash = new Object();
        if (!res) return facilityGroupArray;

        $(res.response).find("facility_group[name]").each(function () {
            $this = $(this);
            var groupId = $this.attr("id");
            if (!groupId) return;

            var facilityGroup = {
                id: groupId,
                key: groupId,
                version: $this.attr("version"),
                order: $this.attr("order"),
                name: $this.attr("name"),
                facilityIdList: []
            };

            // child facility group ids
            var childGroup = $this.children("facility_group");
            if (childGroup.length) {
                facilityGroup.facilityGroupIdList = new Array();
                var j = 0;
                childGroup.each(function () {
                    facilityGroup.facilityGroupIdList[j++] = $(this).attr("id");
                });
                hierarchical = true;
            }

            // member facility ids
            var j = 0;
            $this.find("facility").each(function () {
                var id = $(this).attr("id");
                if (id) {
                    facilityGroup.facilityIdList[j++] = id;
                }
            });

            // parent facility group id
            var parent_facility_group_id = $this.attr("parent_facility_group");
            if (parent_facility_group_id) {
                facilityGroup.parent_facility_group_id = parent_facility_group_id;
                hierarchical = true;
            } else {
                facilityGroupArray[facilityGroupArray.length] = facilityGroup;
            }

            facilityGroupHash[groupId] = facilityGroup;
        });

        return facilityGroupArray;
    };

    this.facilityGroup = function (groupId) {
        /// <summary>指定した設備グループの情報を返す。</summary>
        /// <param name="groupId" type="String">設備グループID</param>
        /// <returns type="Object">設備グループ情報</returns>

        if (!groupId) return null;

        if (!facilityGroupHash) {
            if (this.facilityGroupList() === false) return null;
        }

        return facilityGroupHash[groupId];
    };

    // private functions

    function getEventsFromResponse(response, visStart, visEnd, elementName) {
        var events = new Array();
        var name = elementName ? elementName : "schedule_event";
        $(response).find(name).each(function () {
            var event = createEventFromResponse($(this), visStart, visEnd);
            if (!event) {
                // nothing
            } else if ($.isArray(event)) {
                for (var i = 0; i < event.length; i++) {
                    events[events.length] = event[i];
                }
            } else {
                events[events.length] = event;
            }
        });

        return events;
    }

    function createWhen(event) {
        if (event.allDay) {
            var date = { start: $.cybozuConnect.formatXSDDate(event.start) };
            if (event.end) {
                date.end = $.cybozuConnect.formatXSDDate(event.end);
            } else if (event.event_type == "banner") {
                date.end = date.start;
            }
            return { date: date };

        } else {
            var datetime = { start: $.cybozuConnect.formatISO8601(event.start, true) }; // not xsd:datetime
            if (event.end) {
                datetime.end = $.cybozuConnect.formatISO8601(event.end, true); // not xsd:datetime
            }
            return { datetime: datetime };
        }
    }

    function createEventFromResponse($event, start, end) {
        var when = $event.find("when");
        if (!when.length && start && end) {
            if ($event.attr("event_type") == "repeat") {
                var $repeat_info = $event.find("repeat_info");
                if ($repeat_info.length) {
                    return createRepeatedEventsFromReponse($event, $repeat_info, start, end);
                }
            }
            return null;
        }

        var e = createSingleEventFromResponse($event);
        if (e.allDay) {
            var date = when.find("date");
            e.start = date.attr("start");
            if (!e.start_only) {
                e.end = date.attr("end");
            }
        } else {
            var datetime = when.find("datetime");
            e.start = $.cybozuConnect.parseISO8601(datetime.attr("start"), true);
            if (!e.start_only) {
                e.end = $.cybozuConnect.parseISO8601(datetime.attr("end"), true);
            }
        }

        return e;
    }

    function createRepeatedEventsFromReponse($event, $repeat_info, start, end) {
        var cond = $repeat_info.find("condition");
        var repeatInfo = {
            type: cond.attr("type"),
            day: parseInt(cond.attr("day"), 10),
            week: parseInt(cond.attr("week"), 10),
            start_date: cond.attr("start_date"),
            end_date: cond.attr("end_date")
        };

        var dates = getRepeatDates($repeat_info, repeatInfo, start, end);
        if (!dates.length) return null;

        var events = new Array();
        for (var i = 0; i < dates.length; i++) {
            var date = dates[i];
            var xsdDate = $.cybozuConnect.formatXSDDate(date);

            var e = createSingleEventFromResponse($event);
            if (e.allDay) {
                e.start = xsdDate;
                if (!e.start_only) {
                    e.end = xsdDate;
                }
            } else {
                /*if (!repeatInfo.start_time) {
                var cond = $repeat_info.find("condition");
                repeatInfo.start_time = cond.attr("start_time");
                if (!e.start_only) {
                repeatInfo.end_time = cond.attr("end_time");
                }
                }*/
                e.start = $.cybozuConnect.parseXSDDateTime(xsdDate + "T" + e.repeatInfo.start_time);
                if (!e.start_only && e.repeatInfo.end_time) {
                    e.end = $.cybozuConnect.parseXSDDateTime(xsdDate + "T" + e.repeatInfo.end_time);
                }
                //e.repeatInfo = repeatInfo;
            }

            events[events.length] = e;
        }

        return events;
    }

    function createSingleEventFromResponse($event) {
        var event_type = $event.attr("event_type");
        var plan = $event.attr("plan");
        var detail = $event.attr("detail");
        var start_only = ($event.attr("start_only") == "true");

        var e = new Object;

        // standard properties
        e.id = $event.attr("id");
        if (plan && detail) {
            e.title = plan + ":" + detail;
        } else if (plan) {
            e.title = plan;
        } else if (detail) {
            e.title = detail;
        } else {
            e.title = "--";
        }
        e.allDay = ($event.attr("allday") == "true" || event_type == "banner");

        // class
        if (event_type == "repeat") {
            e.className = "event-repeat";
        } else if (event_type == "banner") {
            e.className = "event-banner";
        } else if (e.allDay) {
            e.className = "event-allday";
        }

        // non-standard properties
        e.event_type = event_type;
        e.version = $event.attr("version");
        e.public_type = $event.attr("public_type");
        e.plan = plan;
        e.detail = detail;
        e.description = $event.attr("description");
        e.timezone = $event.attr("timezone");
        e.start_only = start_only;

        // repeat information
        if (event_type == "repeat") {
            var cond = $event.find("condition");
            if (cond.length) {
                e.repeatInfo = {
                    type: cond.attr("type"),
                    day: cond.attr("day"),
                    week: cond.attr("week"),
                    start_date: cond.attr("start_date"),
                    end_date: cond.attr("end_date"),
                    start_time: cond.attr("start_time"),
                    end_time: cond.attr("end_time")
                };
            }
        }

        // users
        e.users = new Array();
        $event.find("user").each(function () {
            $this = $(this);
            e.users[e.users.length] = { id: $this.attr("id"), name: $this.attr("name"), order: $this.attr("order") };
        });

        // organizations
        e.organizations = new Array();
        $event.find("organization").each(function () {
            $this = $(this);
            e.organizations[e.organizations.length] = { id: $this.attr("id"), name: $this.attr("name"), order: $this.attr("order") };
        });

        // facilities
        e.facilities = new Array();
        $event.find("facility").each(function () {
            $this = $(this);
            e.facilities[e.facilities.length] = { id: $this.attr("id"), name: $this.attr("name"), order: $this.attr("order") };
        });

        if ($event.find("follows").length) {
            e.follows = $event.find("follow");
        }

        return e;
    }

    function getRepeatDates($repeat_info, repeatInfo, start, end) {
        var type = repeatInfo.type;
        var day = repeatInfo.day;
        var week = repeatInfo.week;
        var startDate = $.cybozuConnect.parseXSDDate(repeatInfo.start_date);
        var endDate = $.cybozuConnect.parseXSDDate(repeatInfo.end_date);

        if (startDate.getTime() < start.getTime()) {
            startDate = start;
        }

        if (!endDate || (end.getTime() - 24 * 60 * 60 * 1000) < endDate.getTime()) {
            endDate = new Date();
            endDate.setTime(end.getTime() - 24 * 60 * 60 * 1000);
        }

        var exclusiveDates = new Array();
        $repeat_info.find("exclusive_datetime").each(function () {
            var datetime = $.cybozuConnect.parseXSDDateTime($(this).attr("start"));
            if (datetime) {
                exclusiveDates[exclusiveDates.length] = datetime;
            }
        });

        var dates = new Array();

        var date = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
        var lastDay;
        if (type == "lastweek" || (type == "month" && day == 0)) {
            var lastDate = $.cybozuConnect.getLastDate(date);
            lastDay = lastDate.getDate();
        }
        while (date.getTime() <= endDate.getTime()) {
            var wday = date.getDay();
            var mday = date.getDate();

            var hit = false;
            if (type == "day") {
                hit = true;
            } else if (type == "weekday") {
                hit = (wday != 0 && wday != 6);
            } else if (type == "week") {
                hit = (wday == week);
            } else if (type == "1stweek") {
                hit = (wday == week && mday <= 7);
            } else if (type == "2nweek") {
                hit = (wday == week && 7 < mday && mday <= 14);
            } else if (type == "3rdweek") {
                hit = (wday == week && 14 < mday && mday <= 21);
            } else if (type == "4thweek") {
                hit = (wday == week && 21 < mday && mday <= 28);
            } else if (type == "lastweek") {
                hit = (wday == week && lastDay - 7 < mday && mday <= lastDay);
            } else if (type == "month") {
                if (day == 0) {
                    hit = (mday == lastDay);
                } else {
                    hit = (mday == day);
                }
            }

            if (hit && !inDateArray(date, exclusiveDates)) {
                dates[dates.length] = date;
            }
            date = $.cybozuConnect.incDate(date);
        }

        return dates;
    }

    function inDateArray(date, dateArray) {
        for (var i = 0; i < dateArray.length; i++) {
            if (date.getTime() == dateArray[i].getTime()) return true;
        }
        return false;
    }
};
