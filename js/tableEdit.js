

var removedEvent  //placeholder event that user is selecting to remove from table
var changedEvent  //global variable to  store api return values when a user changes event from dropdown
var arrayLocation //location of the selected events value in reach row's array
var headerLocation //placeholder value to later be able to change header column titles based on id
var newEventSelector // global variable for event selector to be used later
var editTableSelector // variable to hold all selector values
var selectorOptions = {} //create selector options for event picker

newEventSelector = $('#new-event').MPEventSelect()

$('#table-edit-button').click(function() {

	//transform the top topEvents array so that it can be placeed in the new dropdown menu
	//check to see if chart has been edit at least once, if so selectorOptions already has some set values so use those values to populate dropdown. if this is the first edit in the session populate the selector with the top 5 events in the project
	if(selectorOptions.items == undefined){
		selectorOptions.items = [
			{label: 'Select Event', value: "Select Event"},
			{label: topEvents[0], value: topEvents[0]},
			{label: topEvents[1], value: topEvents[1]},
			{label: topEvents[2], value: topEvents[2]},
			{label: topEvents[3], value: topEvents[3]},
			{label: topEvents[4], value: topEvents[4]}
		]
	}else {
		selectorOptions.items = selectorOptions.items;
	}
	$('#table-edit-button').hide() 									// hide edit button
	//show the selector helper text
	$('#selector-text').show()
	//create the top event selector
	$('#table-edit-section').append('<div class="col-sm-6" id="table-selector"></div>')

	var editTable = $('#table-selector').MPSelect(selectorOptions); //create events selector dropdown
	//show the selector button
	editTable.on('change', function(e, selection) {         // Do something when one of the event drop downs are selected
      removedEvent = selection
      var tableRows = $('th')
      _.each(tableRows, function(values, key){
        if(values.textContent == selection){
          arrayLocation = key;					//get array  location so that we can replace the new values in the correct index of each array
  	  		headerLocation = key; 					//get the corresponding header number to later change this value to the new event
      	}
      })
			//remove top event selector so that it can be refreshed if edited again
			$("#table-selector").remove()
			//$("#table-selector").hide()		//high the selector containing the events in the table once the user has selected the event they want to change
      $('#selector-text').html('Event to add. Replacing "'+removedEvent+'"')
      $('#new-event').show()
  	});
})
newEventSelector.on('change', function(e, selection) {      //when the new event to be added to the table is selected run the below
	$("#header"+headerLocation).html(selection)   			//when the new event is selected replace the value in the top row with the new event so chart is up to date
	MP.api.segment(selection, campaignProperty, {from: moment().subtract(30, 'days'), to:moment() , unit: 'day', type: 'general', limit: 50}).done(function(results) {			//run segementation query with new event
		//replace the seletor value with the new event that is being added to the table
		_.each(selectorOptions.items, function(values, key){
			if(values.label === removedEvent){
				selectorOptions.items[key].label = selection
				selectorOptions.items[key].value = selection
			}
		})
			var replacementEvent = results.sum().values()
        graphValues(replacementEvent, headerLocation) //add the new values to dataSet
        //delete all the old rows
        var table = document.getElementById("marketing-table")  //get and store the table
        var numberOfRows = document.getElementById("marketing-table").rows.length;
        var cellDeleteCounter = 1				//create dummy variable to help delete cells as .deleteRow() recalulates the length of the table after each row is deleting so using 'i' in for loop with result in an error as i will eventually be bigger than the table index
        for (var i = 0; i < numberOfRows-1; i++) {				// start for loop at 1 so we don't delete the header row
        	table.deleteRow(cellDeleteCounter)
        }
        document.getElementById("marketing-table").deleteTHead(); //delete the header
        $('.marketing-div').remove()                             //remove the old marketing table div so that when we redraw the table we can bind table sorter to it
				$('#marketing-table').remove()  								//remove table for same reason as above

        //recreate the table with the new event
        $('#table').append('<table class="table table-bordered tablesorter" id="marketing-table"><thead><tr id="header-row"><th class="table-sort header" id="campaign-header">Campaign</th><th class="table-sort header" id="header1"></th><th class="table-sort header" id="header2"></th> <th class="table-sort header" id="header3"></th><th class="table-sort header" id="header4"></th><th class="table-sort header" id="header5"></th><th class="table-sort header" id="header-avg-events">Avg. Events</th><th class="table-sort header" id="header-campaign-spend">Campaign Spend</th><th class="table-sort header" id="header-revenue">Total Revenue         </th><th class="table-sort header" id="header-roi">ROI     </th></tr></thead><tbody></tbody></table>')
				var counter = 0 // create a coutner so that we can grab the index of [0] in the next each loop to assign and id of the campaign for each row
        //add the returned data from the segmentation query to the graph by campaign
       	 _.each(topEvents, function(event, key){ //add new event to table header
          if (event === removedEvent){
            topEvents[key] = selection
          }
        })
        // update the header so that new events are listed
        _.each(topEvents, function(event, key){ //loop through the top events and recreate the header
          var plusOne = key + 1  // count up one since header label starts at 1 not 0
          $("#header"+plusOne).text(event)
        })
        //recreate the marketing table body with the new dataSet
        _.each(dataSet, function(data, row){   // cycle through the full list of data by campaign
						$("#marketing-table tbody").append('<tr class="table-body"id="row-'+dataSet[counter][0]+'"></tr>')
            _.each(data, function(e, key){       // cycle through data for each individual campaign and put into td

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
                cell.id = 'column-'+column
              }else if(key === 2){
                columnid = document.getElementById("header2")
                column = columnid.innerHTML
                cell.id = 'column-'+column
              }else if(key === 3){
                columnid = document.getElementById("header3")
                column = columnid.innerHTML
                cell.id = 'column-'+column
              }else if(key === 4){
                columnid = document.getElementById("header4")
                column = columnid.innerHTML
                cell.id = 'column-'+column
              }else if(key === 5){
                columnid = document.getElementById("header5")
                column = columnid.innerHTML
                cell.id = 'column-'+column
              }else if(key === 6){
                cell.id = 'column-avg-events'
              }else if(key === 7){
                cell.id = 'column-campaign-spends'
                cell.setAttribute('data-toggle', 'tooltip')
                cell.setAttribute('data-placement', 'top')
                cell.setAttribute('title', 'Click Cell to Edit')
                cell.setAttribute('data-container', 'body')
                if(e === 0){
                  cell.id = 'column-campaign-spends'
                  cell.setAttribute('class', 'no-value')
                }
              }else if(key === 8){
                cell.id = 'column-revenue'
              }else{
                cell.id = 'column-roi'
              }
            });
            counter++
        });
        $('#marketing-table').tablesorter({             //bind tablesorter to new table
          widthFixed: true,
          theme: 'blue'
        })
        .tablesorterPager(pagerOptions);               //bind tablepager to new table
        $("#marketing-table").trigger("update");			//make sure that table sorter is updated so it can sort propertly
        $('#new-event').hide()
        $('#selector-text').hide('')
        $('#table-edit-button').show()
        editRevCell()
    })

})
