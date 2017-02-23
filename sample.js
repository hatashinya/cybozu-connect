(function(){
  garoon.events.on('workflow.request.create.show', function(event) {
    var soapUrl = 'your url';
    var myAccess = new GSC.CybozuConnect.App(soapUrl);
    var schedApi = new GSC.CybozuConnect.Schedule(myAccess);
    console.log(schedApi.facilityList());
  });
})();
