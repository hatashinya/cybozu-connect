(function($){
  garoon.events.on('workflow.request.create.show', function(event) {
    var myAccess = new CBLabs.CybozuConnect.App('https://vn-flagship.cybozu-dev.com/g/cbpapi/schedule/api.csp');
    var schedApi = new CBLabs.CybozuConnect.Schedule(myAccess);
    console.log(schedApi.facilityList());
  });
})(myJQuery);
