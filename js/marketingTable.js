
var eventsByCampaign = {} //global var to store events per campaign to be later used in marketing graph
var eventsPerCampaign = function(){ //api query to get numeric summary of events by campaign
    // get jql script params for active users query
    var avgEventsScript = $('#events-per-user-per-campaign-jql').html();
    avgEventsScript = $.trim(avgEventsScript);

    MP.api.jql(avgEventsScript).done(function(results) {
      _.each(results, function(value, key){
        eventsByCampaign[value.key[0]] = (value.value.sum / value.value.count).toFixed(2)
      })
    })
}
eventsPerCampaign()

//get jql script from script tag and change to string to be passed into jql query
var revenueScript = $('#revenue-jql').html();
revenueScript = $.trim(revenueScript)
var revenueObj = {}
// JQL query to get revenue by campaign source
MP.api.jql(revenueScript).done(function(revenue){
  _.each(revenue, function(v, k){     //match the campaigns to returned revenue, if revenue is null do not include. Will be marked as 0 later
    if(v.key[0] !== null){
      revenueObj[v.key[0]] = v.value
    }
  })
})

var topEventsParams = { //set params to get top events
    type: 'general',  // analysis type for the data, can be 'general', 'unique', or 'average'
    limit: 5          // maximum number of results to return
};
//global variables
var topEvents =[]
var topEventsQuery = []
var topCampaigns = []
var eventOneCampaigns = [], eventTwoCampaigns =[], eventThreeCampaigns =[], eventFourCampaigns =[], eventFiveCampaigns =[] // array to hold all campaigns found on top events
var eventOne, eventTwo, eventThree, eventFour, eventFive // event variables to hold sum of daily counts
var dataSet = [] //global variable to hold final data for campaigns chart
var campaignProperty = 'utm_campaign'

var topWebEventsScript = $('#jql-top-web-events').html();
topWebEventsScript = $.trim(topWebEventsScript)
$('#marketing-table-header').show() //show the header to loading visual makes sense

MP.api.jql(topWebEventsScript).done(function(results) { //run top events query
  _.each(results[0], function(event){
    topEvents.push(event.key[0])     // create an array to store top 5 events in for later use in chart and queries
  })

  MP.api.segment(topEvents[0], campaignProperty, {from: moment().subtract(30, 'days'), to:moment() , unit: 'day', type: 'general', limit: 50}).done(function(topEventOneResult) {
    eventOne = topEventOneResult.sum().values()


    _.each(eventOne, function(value, key){ // loop through summed results to pull out all campaign names
      eventOneCampaigns.push(key) // assign to array
    })
    MP.api.segment(topEvents[1], campaignProperty, {from: moment().subtract(30, 'days'), to:moment() , unit: 'day', type: 'general', limit: 50}).done(function(topEventTwoResult) {
      eventTwo = topEventTwoResult.sum().values()

        _.each(eventTwo, function(value, key){ // loop through summed results to pull out all campaign names
          eventTwoCampaigns.push(key) // assign to array
        })
      MP.api.segment(topEvents[2], campaignProperty, {from: moment().subtract(30, 'days'), to:moment() , unit: 'day', type: 'general', limit: 50}).done(function(topEventThreeResult) {
        eventThree = topEventThreeResult.sum().values()

          _.each(eventThree, function(value, key){ // loop through summed results to pull out all campaign names
            eventThreeCampaigns.push(key) // assign to array
          })
        MP.api.segment(topEvents[3], campaignProperty, {from: moment().subtract(30, 'days'), to:moment() , unit: 'day', type: 'general', limit: 50}).done(function(topEventFourResult) {
          eventFour = topEventFourResult.sum().values()

            _.each(eventFour, function(value, key){ // loop through summed results to pull out all campaign names
              eventFourCampaigns.push(key) // assign to array
            })
          MP.api.segment(topEvents[4], campaignProperty, {from: moment().subtract(30, 'days'), to:moment() , unit: 'day', type: 'general', limit: 50}).done(function(topEventFiveResult) {
            eventFive = topEventFiveResult.sum().values()

            _.each(eventFive, function(value, key){ // loop through summed results to pull out all campaign names
              eventFiveCampaigns.push(key) // assign to array
            })

            topCampaigns = _.union(eventOneCampaigns,eventTwoCampaigns,eventThreeCampaigns,eventFourCampaigns,eventFiveCampaigns) // filter out duplicate campaign names from all array to creat final campaign list for chart

            _.each(topCampaigns, function(v, k){   //create the second dimension of the array and assign the campaign name as the first value
              var secondDimension = [v,0,0,0,0,0,'n/a',0,0,0]
              dataSet.push(secondDimension)
            })
            //loop through each of the top five events and if we match a campaign make sure to assign the count for that event to the right row and column

            var count = 1 // create a "counter" so that we an increment up to the correct place in the nested array for each event. Start at a value of 1 since each array within the dataSet array has postions of [0] = campaign name, [1] = top event, [2] = second top event, etc
            graphValues(eventOne, count)
            count++
            graphValues(eventTwo, count)
            count++
            graphValues(eventThree, count)
            count++
            graphValues(eventFour, count)
            count++
            graphValues(eventFive, count)
            count++
            graphValues(eventsByCampaign, count)

            //add the revenue information to the chart from the JQL query
            _.each(revenueObj, function(v, k){
              _.each(dataSet, function(datasetValue, datasetKey){
                if(k === datasetValue[0]){
                  dataSet[datasetKey][8] = addCommas(v)
                }
              })
            })
            // get jql script params for query that will check campaign_spend_entered event to add previously saved campaign data to the table
            var savedCampaignSpend = $('#saved-campaign-spend').html();
            savedCampaignSpend = $.trim(savedCampaignSpend);
            //run query
            MP.api.jql(savedCampaignSpend).done(function(results) {
              var campaignData = []
              _.each(results, function(eventDetails, events){
                var obj = {
                  campaign: eventDetails.properties.details.campaign,
                  spend: eventDetails.properties.details.spend,
                  date_saved: eventDetails.time
                }
                campaignData.push(obj)
              })
              var oldTimeObj = {} //set a placeholder variable for the time that the user last change the campaign spend of a campaign
              _.each(topCampaigns, function(campaignName, index){
                oldTimeObj[campaignName] = 0
              })
              //loop through the current data set and the new RIO info to see if we have previously set campaign spends. if we do make sure to set them in the campaign spend column and calculate the roi
              _.each(dataSet, function(array, index){
                _.each(campaignData, function(campaignObj, indexObj){
                  if(array[0] === campaignObj['campaign']){
                    var campaignNamePlaceholder = campaignObj['campaign']
                    var lastSavedTime = campaignObj['date_saved']
                    //need to make it so that we check to see if the old time is greater or less than new time. if the new time is greater (more recent), replace the campaign spend since this was the more recently saved value
                    _.each(oldTimeObj, function (time, name) {
                      if (campaignNamePlaceholder === name && lastSavedTime >= oldTimeObj[campaignNamePlaceholder]) {
                        oldTimeObj[campaignNamePlaceholder] = lastSavedTime        //set the placeholder saved time object so that the new time is saved for comparison later
                        dataSet[index][7] = addCommas(campaignObj['spend'])          // if one of the campaigns from the jql query matached a campiagn from the array add the spend for that campaign to the dataSet array before the graph is made
                        var campaignSpend = campaignObj['spend']                    // set the matched campaign spend to a variable to make it easier to read
                        var revenue
                        if(typeof dataSet[index][8] === 'number'){                  // make sure the value returned is actually a string before running replace on the value
                          revenue = dataSet[index][8]
                        }else {
                          revenue = parseInt(dataSet[index][8].replace(/,/g , ""))
                        }
                        var roiCalc = (((revenue-campaignSpend)/campaignSpend)*100).toFixed(0) +"%"   //calculate ROI
                        dataSet[index][9] = roiCalc                                         //set the calculated ROI to array so it is diplayed when the chart is updated
                      }
                    })
                  }
                })
              })
              //add the table header to the graph before the rest of the data is added
              $("#marketing-table").append('<thead><tr id="header-row"><th class="table-sort header" id="campaign-header">Campaign</th><th class="table-sort header" id="header1"></th><th class="table-sort header" id="header2"></th> <th class="table-sort header" id="header3"></th><th class="table-sort header" id="header4"></th><th class="table-sort header" id="header5"></th><th class="table-sort header" id="header-avg-events">Avg. Events</th><th class="table-sort header" id="header-campaign-spend">Campaign Spend</th><th class="table-sort header" id="header-revenue">Total Revenue         </th><th class="table-sort header" id="header-roi">ROI     </th></tr></thead>')
              _.each(topEvents, function(event, key){ //top through the top events an assign them to a column header
                var plusOne = key + 1  // count up one since header label starts at 1 not 0

                $("#header"+plusOne).text(event)
              })
              var counter = 0 // create a coutner so that we can grab the index of [0] in the next each loop to assign and id of the campaign for each row
              //add the returned data from the segmentation query to the graph by campaign
              _.each(dataSet, function(data, row){   // cycle through the full list of data by campaign
                $("#marketing-table").append('<tr class="table-body"id="row-'+dataSet[counter][0]+'"></tr>')
                _.each(data, function(e, key){       // cyce through data for each individual campaign and put into td

                  //get each row
                  var newRow = document.getElementById("row-"+dataSet[counter][0])

                  //add the dataSet data to each row based on campaign
                  var cell = newRow.insertCell(key)
                  //add the values from the data set to the cell HTML
                  cell.innerHTML = e
                  //add an id to the cell

                  var column = ""       //placeholder variable
                  var columnid = ""     //placeholder variable
                  if(key === 0 ){
                    cell.id = 'column-campaign'
                  }else if(key === 1){
                    columnid = document.getElementById("header1")
                    column = columnid.innerHTML
                    cell.id = 'column-'+column.replace(/ /g , "-")
                     cell.setAttribute('class', 'table-data')
                  }else if(key === 2){
                    columnid = document.getElementById("header2")
                    column = columnid.innerHTML
                    cell.id = 'column-'+column.replace(/ /g , "-")
                    cell.setAttribute('class', 'table-data')
                  }else if(key === 3){
                    columnid = document.getElementById("header3")
                    column = columnid.innerHTML
                    cell.id = 'column-'+column.replace(/ /g , "-")
                    cell.setAttribute('class', 'table-data')
                  }else if(key === 4){
                    columnid = document.getElementById("header4")
                    column = columnid.innerHTML
                    cell.id = 'column-'+column.replace(/ /g , "-")
                    cell.setAttribute('class', 'table-data')
                  }else if(key === 5){
                    columnid = document.getElementById("header5")
                    column = columnid.innerHTML
                    cell.id = 'column-'+column.replace(/ /g , "-")
                    cell.setAttribute('class', 'table-data')
                  }else if(key === 6){
                    cell.id = 'column-avg-events'
                    cell.setAttribute('class', 'table-data')
                  }else if(key === 7){
                    cell.id = 'column-campaign-spends'
                    cell.setAttribute('data-toggle', 'tooltip')
                    cell.setAttribute('data-placement', 'top')
                    cell.setAttribute('title', 'Click Cell to Edit')
                    cell.setAttribute('data-container', 'body')
                     cell.setAttribute('class', 'table-data')
                    if(e === 0){
                      cell.id = 'column-campaign-spends'
                      cell.setAttribute('class', 'table-data no-value')
                    }
                  }else if(key === 8){
                    cell.id = 'column-revenue'
                    cell.setAttribute('class', 'table-data')
                  }else{
                    cell.id = 'column-roi'
                    cell.setAttribute('class', 'table-data')
                  }
                });
                counter++
              });

              //make it so that a person can click on the revenue cell to edit
              editRevCell();

                //set tablepager options
                pagerOptions = {
                  // target the pager markup - see the HTML block below
                  container: $(".pager"),
                  // output string - default is '{page}/{totalPages}';
                  // possible variables: {size}, {page}, {totalPages}, {filteredPages}, {startRow}, {endRow}, {filteredRows} and {totalRows}
                  // also {page:input} & {startRow:input} will add a modifiable input in place of the value
                  output: '{startRow} - {endRow} / {filteredRows} ({totalRows})',
                  // if true, the table will remain the same height no matter how many records are displayed. The space is made up by an empty
                  // table row set to a height to compensate; default is false
                  fixedHeight: true,
                  // remove rows from the table to speed up the sort of large tables.
                  // setting this to false, only hides the non-visible rows; needed if you plan to add/remove rows with the pager enabled.
                  removeRows: false,
                  // go to page selector - select dropdown that sets the current page
                  cssGoto: '.gotoPage',
                  //default number of results to show in first view of table
                  size: 5
                };

                //inilize tablesorter
                $('#marketing-table').tablesorter({
                  widthFixed: true,
                  theme: 'blue'
                })
                .tablesorterPager(pagerOptions);
                $('#loading-container').hide()
                $('.dropdown').show()
                $('#table-edit').show()
                $('[data-toggle="tooltip"]').tooltip()
                $("#export").show()
                $("#export").click(function(){
                  $("#marketing-table").tableToCSV();
                });

            })
          });
        });
      });
    });
  });
});
