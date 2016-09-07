$('#save-all').click(function () {
  //show modal
  $('#save-all-modal').modal('show')
  //collect the token from the user

  //send out track request that saves the conditions of all the reports
  //how to save the state of the reports -
  //when a report is run save the report params in a global object
  //use this global object then in a track call
  //will have to create a new process at the top of the report that pull out the conditions and applies them before running any of the reports
})

// save all the previously changed data
$('#save-all-confirm').on('click',function(){
  //store the user entered token
  var projectToken = $('#project-token-input').val()
  console.log("input type is: ", typeof projectToken);
  console.log(changeDetails);
  for (var i = 0; i < queuedDataForSaving.length; i++) {
    console.log("campaign - ", queuedDataForSaving[i].campaign);
    console.log("spend for campaign - ", queuedDataForSaving[i].spend);
    var saving = {
      'event': 'campaign_spend_entered',
      'properties': {
        'token': projectToken,
        'details':{
          'campaign': queuedDataForSaving[i].campaign,
          'spend': queuedDataForSaving[i].spend
        }
      }
    }
    var stringVersion = JSON.stringify(saving)
    console.log('JSON version of data',stringVersion);
    var encoded = window.btoa(stringVersion)
    $.ajax({
      url: "https://api.mixpanel.com/track/?data="+encoded
    })
  }
  queuedDataForSaving = []
})
