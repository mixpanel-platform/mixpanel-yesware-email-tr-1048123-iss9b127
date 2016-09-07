//formatting to add commas to numbers
function addCommas(intNum) {
  return (intNum + '').replace(/(\d)(?=(\d{3})+$)/g, '$1,');
}

//apply data to dataSet variable
function graphValues(eventParam, count){ // helper function for ordering data for marketing table
  
  _.each(eventParam, function(value, key){ //for top event
    _.each(dataSet, function(datasetValue, datasetKey){
      if(key === datasetValue[0]){
        dataSet[datasetKey][count] = addCommas(value)
        if (eventParam = eventsByCampaign){

        }
      }
    })
  })                  
}