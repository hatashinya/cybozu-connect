/*
* cybozu-connect v1.1.3 - Cybozu API JavaScript Library
*
* utility functions as jquery plugins
*
* @requires jQuery v1.4.1 or later.
*
* Copyright (c) 2011 Cybozu Labs, Inc.
* http://labs.cybozu.co.jp/
*
* Licensed under the GPL Version 2 license.
*/

(function ($) {

    $.cybozuConnect = {
        /// <summary>ユーティリティ関数</summary>

        xmlDom: function (text) {
            /// <summary>XMLからDOMを構築する。</summary>
            /// <param name="text" type="String">XML</param>
            /// <returns type="Object">DOM。構築できなかった場合 null を返す。</returns>

            if (window.ActiveXObject) {
                var dom = new ActiveXObject("Microsoft.XMLDOM");
                dom.loadXML(text);
                return dom;
            } else if (window.DOMParser) {
                var dom = new DOMParser().parseFromString(text, "application/xml");
                if (dom.documentElement.tagName != "parsererror") return dom;
                text = text.replace(/[\x00-\x08\x0b-\x0c\x0e-\x1f\x7f]/g, "");
                return new DOMParser().parseFromString(text, "application/xml");
            } else {
                return null;
            }
        },

        htmlEscape: function (text) {
            /// <summary>HTMLエスケープを行う。</summary>
            /// <param name="text" type="String">エスケープする文字列</param>
            /// <returns type="String">エスケープされた文字列</returns>

            return text.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#039;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        },

        xmlEscape: function (text) {
            /// <summary>XMLエスケープを行う。</summary>
            /// <param name="text" type="String">エスケープする文字列</param>
            /// <returns type="String">エスケープされた文字列</returns>

            return text.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&apos;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        },

        xmlAttributeEscape: function (text) {
            /// <summary>XMLの属性値としてのエスケープを行う。</summary>
            /// <param name="text" type="String">エスケープする文字列</param>
            /// <returns type="String">エスケープされた文字列</returns>

            return $.cybozuConnect.htmlEscape(text).replace(/\r/g, "&#xD;").replace(/\n/g, "&#xA;");
        },

        nn: function (num) {
            /// <summary>２桁の整数に対し、０パディングした文字列を返す。</summary>
            /// <param name="num" type="Number">２桁の整数</param>
            /// <returns type="String">０パディングされた文字列</returns>

            return _nn(num);
        },

        formatXSDDate: function (value) {
            /// <summary>日付をxsd:date形式でフォーマットする。</summary>
            /// <param name="value" type="Date">日付</param>
            /// <returns type="String">フォーマットされた文字列</returns>

            var d;
            if (value instanceof Date) {
                d = value;
            } else if (typeof value == "number") {
                d = new Date();
                d.setTime(value);
            } else {
                d = new Date(value);
            }

            var year = d.getFullYear();
            var month = d.getMonth() + 1;
            var day = d.getDate();
            return year + "-" + _nn(month) + "-" + _nn(day);
        },

        formatXSDDateTime: function (value, utc) {
            /// <summary>日時をxsd:datetime形式でフォーマットする。</summary>
            /// <param name="value" type="Date, Number">日時。型がNumberの場合はタイムスタンプ値</param>
            /// <param name="utc" type="Boolean">UTCとして扱うか否か</param>
            /// <returns type="String">フォーマットされた文字列</returns>

            var d;
            if (value instanceof Date) {
                d = value;
            } else if (typeof value == "number") {
                d = new Date();
                d.setTime(value);
            } else {
                d = new Date(value);
            }

            var year, month, day, hours, minutes, seconds;
            if (utc) {
                year = d.getUTCFullYear();
                month = d.getUTCMonth() + 1;
                day = d.getUTCDate();
                hours = d.getUTCHours();
                minutes = d.getUTCMinutes();
                seconds = d.getUTCSeconds();
            } else {
                year = d.getFullYear();
                month = d.getMonth() + 1;
                day = d.getDate();
                hours = d.getHours();
                minutes = d.getMinutes();
                seconds = d.getSeconds();
            }
            return year + "-" + _nn(month) + "-" + _nn(day) + "T" + _nn(hours) + ":" + _nn(minutes) + ":" + _nn(seconds);
        },

        formatXSDTime: function (date) {
            /// <summary>時刻をxsd:time形式でフォーマットする。</summary>
            /// <param name="value" type="Date">時刻</param>
            /// <returns type="String">フォーマットされた文字列</returns>

            return _nn(date.getHours()) + ":" + _nn(date.getMinutes()) + ":" + _nn(date.getSeconds());
        },

        formatISO8601: function (value, utc) {
            /// <summary>日時をISO8601形式でフォーマットする。</summary>
            /// <param name="value" type="Date, Number">日時。型がNumberの場合はタイムスタンプ値</param>
            /// <param name="utc" type="Boolean">UTCとして扱うか否か</param>
            /// <returns type="String">フォーマットされた文字列</returns>

            return $.cybozuConnect.formatXSDDateTime(value, utc) + "Z";
        },

        parseISO8601: function (text, utc) {
            /// <summary>ISO8601形式の文字列をパースして、Date型を返す。</summary>
            /// <param name="text" type="String">>ISO8601形式の文字列</param>
            /// <param name="utc" type="Boolean">UTCとして扱うか否か</param>
            /// <returns type="Date">パースされた日時</returns>

            if (text.length < 20) {
                return new Date();
            }
            var year = text.substr(0, 4);
            var month = text.substr(5, 2) - 1;
            var day = text.substr(8, 2);
            var hours = text.substr(11, 2);
            var minutes = text.substr(14, 2);
            var seconds = text.substr(17, 2);
            if (utc) {
                var t = Date.UTC(year, month, day, hours, minutes, seconds);
                var d = new Date();
                d.setTime(t);
                return d;
            } else {
                return new Date(year, month, day, hours, minutes, seconds);
            }
        },

        parseXSDDate: function (text) {
            /// <summary>xsd:date形式の文字列をパースして、Date型を返す。</summary>
            /// <param name="text" type="String">xsd:date形式の文字列</param>
            /// <returns type="Date">パースされた日付</returns>

            if (!text) return null;
            var vals = text.split("-");
            if (vals.length < 3) return null;
            return new Date(parseInt(vals[0], 10), parseInt(vals[1], 10) - 1, parseInt(vals[2], 10));
        },

        parseXSDDateTime: function (text) {
            /// <summary>xsd:datetime形式の文字列をパースして、Date型を返す。</summary>
            /// <param name="text" type="String">xsd:datetime形式の文字列</param>
            /// <returns type="Date">パースされた日時</returns>

            if (!text) return null;
            var vals = text.split("T");
            if (vals.length < 2) return null;
            var date = $.cybozuConnect.parseXSDDate(vals[0]);
            if (!date) return null;
            vals = vals[1].split("+");
            vals = vals[0].split(":");
            if (vals.length < 3) return null;
            return new Date(date.getFullYear(), date.getMonth(), date.getDate(), parseInt(vals[0], 10), parseInt(vals[1], 10), parseInt(vals[2], 10));
        },

        incDate: function (date, dayDelta) {
            /// <summary>日付を指定分進める。</summary>
            /// <param name="date" type="Date">基準となる日付</param>
            /// <param name="dayDelta" type="Number">進める日数。マイナスの場合は戻す。</param>
            /// <returns type="Date">進められた日付</returns>

            if (dayDelta == 0) return new Date(date);
            var d = new Date();
            if (!dayDelta) dayDelta = 1;
            d.setTime(date.getTime() + dayDelta * 24 * 60 * 60 * 1000);
            return d;
        },

        getLastDate: function (date) {
            /// <summary>指定した日付の月末の日付を返す。</summary>
            /// <param name="date" type="Date">日付</param>
            /// <returns type="Date">月末の日付</returns>

            var nextMonth;
            if (date.getMonth() < 11) {
                nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);
            } else {
                nextMonth = new Date(date.getFullYear() + 1, 0, 1);
            }
            var lastDate = new Date();
            lastDate.setTime(nextMonth.getTime() - 24 * 60 * 60 * 1000);
            return lastDate;
        },

        getLastDay: function (year, month) {
            /// <summary>指定した年/月の月末の日付の日番号を返す。</summary>
            /// <param name="year" type="Number">年</param>
            /// <param name="month" type="Number">月</param>
            /// <returns type="Number">月末の日番号(1～31)</returns>

            return $.cybozuConnect.getLastDate(new Date(year, month, 1)).getDate();
        },

        equalDate: function (date1, date2) {
            /// <summary>２つの日付が同日かどうかを返す。</summary>
            /// <param name="date1" type="Date">日付１</param>
            /// <param name="date2" type="Date">日付２</param>
            /// <returns type="Boolean" />

            return date1.getFullYear() == date2.getFullYear() && date1.getMonth() == date2.getMonth() && date1.getDate() == date2.getDate();
        },

        compareDate: function (date1, date2) {
            /// <summary>２つの日付を比較する。</summary>
            /// <param name="date1" type="Date">日付１</param>
            /// <param name="date2" type="Date">日付２</param>
            /// <returns type="Number">0: 等しい、<0: 日付１が日付２よりも先、>0: 日付１が日付２よりも後</returns>

            var diffYear = date1.getFullYear() - date2.getFullYear();
            if (diffYear) return diffYear;
            var diffMonth = date1.getMonth() - date2.getMonth();
            if (diffMonth) return diffMonth;
            var diffDay = date1.getDate() - date2.getDate();
            if (diffDay) return diffDay;
            return 0;
        }
    };

    // private function

    function _nn(num) {
        return ((num < 10) ? "0" : "") + num;
    };

})(jQuery);

