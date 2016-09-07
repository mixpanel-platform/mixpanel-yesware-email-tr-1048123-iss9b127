//global vairables
var revenueCell
var roiCell
var campaign
var campaignSpendCell
//make revenue cell editable

function editRevCell(){
  $('#marketing-table #column-campaign-spends').on( 'click', function () {
    //pulling the name of the campaign from the first column in the chart

    campaign = $(this).siblings().html()
    campaignSpendCell = $(this) // get the cell the user clicked on to enter campaign spend

    roiCell = $(this).next().next() //get the corresponding ROI cell and store value to later replace
    campaignEdited = $(this).prev().prev().prev().prev().prev().prev().prev().text()
    console.log('campaign edited', campaignEdited)
    revenueCell = $(this).next().text() //get the corresponding revenue cell and store value to later do ROI math with
    $('#revenue-modal').modal('show')
    $('#camp-spend-modal-save').on('click',function(){
      //store the user entered amount
      campaignAmount = $('#campaign-spend-input').val()
      var inputType = parseInt(campaignAmount)
      //check to make sure a value was entered before closing the modal, if not keep the model open
      if (campaignAmount === undefined || campaignAmount == null){
        $('#revenue-modal').modal('show')
      //else update the campaign spend cell and calculate ROI
      }else{
        //send out track call to store campaign spend data in project. Only works when run outside of MP webpage. Demo use only at the moment
        changeDetails = {}
        changeDetails.campaign = campaignEdited
        changeDetails.spend  = campaignAmount
        queuedDataForSaving.push(changeDetails)
        // mixpanel.track('campaign_spend_entered',{'details':{
        //   'campaign': campaignEdited,
        //   'spend': campaignAmount
        // }})
        //loop throught the entire table data set
        _.each(dataSet, function(arrayValue){
          //if we find a the campaign that matches the campaign of the row the user is editing update the campaign spend cell
          if(arrayValue[0] === campaign){
            // add user entered amount to table
            campaignSpendCell.text(addCommas(campaignAmount))
            //remove class to take away red highlighting
            campaignSpendCell.removeClass("no-value")
            //remove commas from revenue cell so we can do roi calculation if the input is returning as a string value (doesn't always happen)
            if (typeof revenueCell === 'string'){
              revenueCell = parseInt(revenueCell.replace(/,/g , ""))
            }

            var roiCalc = (((revenueCell-campaignAmount)/campaignAmount)*100).toFixed(0) +"%"
            roiCell.text(roiCalc)
          }
        })
      }
    //update tablesorter cache so that after a person enters in campaign spend the table can be resorted properly
    $("#marketing-table").trigger("update");
    })
  });
}
