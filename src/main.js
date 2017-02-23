'use strict'
var App = require("./core");
var Base  = require("./base");
var scheduleSystemProfile  = require("./scheduleSystemProfile");
var schedulePersonalProfile  = require("./schedulePersonalProfile");
var schedule  = require("./schedule");
var myUtility  = require("./utility");
var GSC = {
  CybozuConnect:{}  
}
GSC.CybozuConnect.App = App
GSC.CybozuConnect.Base = Base 
GSC.CybozuConnect.ScheduleSystemProfile = scheduleSystemProfile
GSC.CybozuConnect.SchedulePersonalProfile = schedulePersonalProfile
GSC.CybozuConnect.Schedule = schedule
GSC.CybozuConnect.myUtility = myUtility
window.GSC = GSC;