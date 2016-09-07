var dauQuery = function(){
    // get jql script params for active users query, return result is daus this month
    var newDAUActiveUserScript = $('#jql-dau-active-users').html();
    newDAUActiveUserScript = $.trim(newDAUActiveUserScript);

    //placeholders for graph
    var DAUs = {}
    var dauData ={}
  
    MP.api.jql(newDAUActiveUserScript).done(function(results) {
      var dauToday = results.length - 1
      dauToday = results[dauToday].value
      $('#dau-header').text(addCommas(dauToday));

      _.each(results, function(value, key){
        DAUs[value.key[0]] = value.value
      })
     dauData.DAUs = DAUs

    var mdauChart = $('#dau-chart').MPChart({chartType: 'line', highchartsOptions: {  // Create a line chart
      legend: {
        enabled: true,
        y:-7
      },
    }});                                
    mdauChart.MPChart('setData', dauData); // Set the chart's data
      $("#dau-chart-header").show()           //display chart header
    })

    setTimeout(dauQuery,3600000)
}
dauQuery();