(function($){
  garoon.events.on('workflow.request.create.show', function(event) {
    var soapUrl = 'your url';
    var myAccess = new CBLabs.CybozuConnect.App(soapUrl);
    var schedApi = new CBLabs.CybozuConnect.Schedule(myAccess);
    console.log(schedApi.facilityList());
  });
})(myJQuery);
