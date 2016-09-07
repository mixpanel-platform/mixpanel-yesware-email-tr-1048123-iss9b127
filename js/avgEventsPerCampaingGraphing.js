// get jql script params for query
var campaignAvgEventScript = $('#events-per-user-per-campaign-by-day-jql').html();
campaignAvgEventScript = $.trim(campaignAvgEventScript);

//global variable for graph
var campaignlist =[]
var avgEventsData = {}

//send out api request
MP.api.jql(campaignAvgEventScript).done(function(results) {

_.each(results, function(value){    //get all the campaign name and add them to an array to be used later
  campaignlist.push(value.key[0])
})
campaignlist = _.uniq(campaignlist) //get unique values

_.each(campaignlist, function(values, key){
  avgEventsData[values] = {}
})

_.each(avgEventsData, function(objValue, objkey){
  var placehoder ={}
  _.each(results, function(values,key){
    if(objkey === values.key[0]){
      placehoder[values.key[1]] = parseFloat((values.value.sum/values.value.count).toFixed(2))
    }
  })

  avgEventsData[objkey] = placehoder

})
// Create a line chart
var avgEventsChart = $('#events-per-user-per-campaign-chart').MPChart({chartType: 'line', highchartsOptions: {
  legend: {
    enabled: false,
    y: -7,
    x: 20,
    useHTML:true,
    labelFormatter: function() {

     return   '<span class="legend-title">'+this.name+'</span>';
    }
  }
}});
  avgEventsChart.MPChart('setData', avgEventsData); // Set the chart's data
  $('#avg-campaign-header').show()
})
