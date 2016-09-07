// set global params
var bounceRate = 0
var graphingData = {}
var campaignlist =[]
//set params to be passed into JQL queries
var today = new Date().toISOString().split('T')[0]
var d = new Date();
d.setMonth(d.getMonth() - 1);
var aMonthAgo = new Date(d).toISOString().split("T")[0]
var params = {
  start_date: aMonthAgo,
  end_date: today
 }
 //query to see users who bounced by campaign
MP.api.jql(
  function main() {
    return Events({
      from_date: params.start_date,
      to_date:   params.end_date
    })
    .groupByUser(['properties.utm_campaign',function(event){ return new Date(event.time).toISOString().substr(0, 10)}], mixpanel.reducer.count())
    .filter(function(item){
      if (item.value < 6){
        return item
      }
    })
    .groupBy(['key.1', 'key.2'], mixpanel.reducer.count())
  },
params).done(function(bounceResults){
  //query for users who did not bounce
  MP.api.jql(
    function main() {
      return Events({
        from_date: params.start_date,
        to_date:   params.end_date
      })
      .groupByUser(['properties.utm_campaign',function(event){ return new Date(event.time).toISOString().substr(0, 10)}], mixpanel.reducer.count())
      .groupBy(['key.1', 'key.2'], mixpanel.reducer.count())
    },
  params).done(function(nonBounceResults){
    //get all the campaign in a uniquelist
    _.each(bounceResults, function(value){    //get all the campaign name and add them to an array to be used later
      campaignlist.push(value.key[0])
    })
    //get all the campaign name and add them to an array to be used later
    _.each(bounceResults, function(value){
      campaignlist.push(value.key[0])
    })
    //get unique values
    campaignlist = _.uniq(campaignlist)

    //start creating a object in the correct format be accepted by MPChart
    _.each(campaignlist, function(values, key){
      graphingData[values] = {}
    })

   var monthlyData ={}
   //combine the bounced and nonbounce data to get a bounce rate
    _.each(bounceResults, function (bounceValue, bounceKey) {
      _.each(nonBounceResults, function(nonBounceValue, nonBounceKey){
        if(bounceValue.key[0] === nonBounceValue.key[0] && bounceValue.key[1] === nonBounceValue.key[1]){ // if the campaign name and the date match calculate the bounce rate
          bounceRate = parseFloat(((bounceValue.value/nonBounceValue.value)).toFixed(2))
          graphingData[bounceValue.key[0]][nonBounceValue.key[1]] = bounceRate


        }
      })
    })


  var mauChart = $('#campaign-bounce-rate').MPChart({chartType: 'line', highchartsOptions: {
    legend: {
      enabled: false,
      y: -7
    }
  }});                                // Create a line chart
  mauChart.MPChart('setData', graphingData); // Set the chart's data
  $('#bounce-rate-header').show()
  })//end of second jql query
}) // end of first jql query
