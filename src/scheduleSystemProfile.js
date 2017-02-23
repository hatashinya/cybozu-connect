/*
* garoon-soap-connecter v1.0.0 - Cybozu API JavaScript Library
*
* GSC.CybozuConnect.ScheduleSystemProfile class
*
* Copyright (C) 2017 Cybozu, Inc.
*/
var scheduleSystemProfile = function (res) {
    /// <summary>スケジュールのシステム設定を表すクラス</summary>
    /// <param name="res" type="Object">APIからのレスポンス</param>
    /// <returns type="GSC.CybozuConnect.ScheduleSystemProfile" />

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
module.exports = scheduleSystemProfile;