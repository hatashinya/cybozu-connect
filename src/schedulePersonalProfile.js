/*
* garoon-soap-connecter v1.0.0 - Cybozu API JavaScript Library
*
* GSC.CybozuConnect.SchedulePersonalProfile class
*
* Copyright (C) 2017 Cybozu, Inc.
*/
var schedulePersonalProfile = function (res) {
    /// <summary>スケジュールの個人設定を表すクラス</summary>
    /// <param name="res" type="Object">APIからのレスポンス</param>
    /// <returns type="GSC.CybozuConnect.SchedulePersonalProfile" />
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
module.exports = schedulePersonalProfile;