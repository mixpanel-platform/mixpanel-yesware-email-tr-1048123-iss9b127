//graph out the average number of events that users are sending per project at the project level (overall)

// get jql script params for query
var avgEventsPerDayScript = $('#events-per-user-by-day-jql').html();
avgEventsPerDayScript = $.trim(avgEventsPerDayScript);

//global variable for graph
var avgEventsPerDayData = {}
var dailyobj = {}

//send out api request
MP.api.jql(avgEventsPerDayScript).done(function(results) {

  //add values to header panel for average events today
  var lastValue = results.length -1

  var headerData = addCommas((results[lastValue].value.sum/results[lastValue].value.count).toFixed(2))
  $('#avg-events').text(headerData);
  if(headerData < 11){             //if the number of avg events per user is less than 11 make the box red
    $('#avg-events').parent().parent().parent().parent().attr('class','panel panel-red')
  }

  //transform data to get it ready for charting
  _.each(results, function(value, key){
    dailyobj[value.key[0]] = parseFloat((value.value.sum/value.value.count).toFixed(2))
  })
  //final data transformation befor charting
  avgEventsPerDayData.Average_Events = dailyobj

  // Create a line chart
  var avgEventsPerDayChart = $('#avg-events-per-user-per-day-chart').MPChart({chartType: 'line', highchartsOptions: {
    legend: {
      enabled: true,
      y: -7
    }
  }});
  avgEventsPerDayChart.MPChart('setData', avgEventsPerDayData); // Set the chart's data
  $('#avg-per-user-header').show()
})
