var graphRevenue = function () {
    var revResults
    // get jql script params for query
    var revToday = $('#revenue-today-jql').html();
    revToday = $.trim(revToday);
    
    MP.api.jql(revToday).done(function(revResults) { // run jql query          
         $('#revenue-header').text("$"+addCommas(revResults)); //add results to header 
    })        
}
graphRevenue()