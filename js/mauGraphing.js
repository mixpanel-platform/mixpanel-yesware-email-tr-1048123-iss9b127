
var mauQuery = function(){
    // get CQ script params for query
    var mauScript = $('#monthly-active-users').html();
    mauScript = $.trim(mauScript);
    //send out api request
    MP.api.jql(mauScript).done(function(results) {

      //get the last value in the results so you have the value of this months MAU's
      var thisMonthIndex = results.length - 1 
      $('#mau-header').text(addCommas(results[thisMonthIndex].value));

      //transform data so that we can graph it month over month
      //placeholders for graph
      var MAUs = {}
      var mauData ={}
      _.each(results, function(value, key){
          MAUs[value.key[0]] = value.value
        })
       mauData.MAUs = MAUs

      var mauChart = $('#mau-chart').MPChart({chartType: 'line', highchartsOptions: {
        legend: {
          enabled: true,
          y: -7
        }
      }});                                // Create a line chart
      mauChart.MPChart('setData', mauData); // Set the chart's data
      $('#mau-chart-header').show()        //display chart header
    })
    
}
mauQuery()
