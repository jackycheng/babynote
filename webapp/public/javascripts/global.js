var noteCount = 0;
// DOM Ready =============================================================
$(document).ready(function() {
  $("#note-item-templete").hide();
  // Populate the user table on initial page load
  populateTable();

  $("#growth-date").datepicker({dateFormat: 'mm-dd-yy'});
  //$("#growth-date").val($.datepicker.formatDate('mm-dd-yy', new Date()));
  $('#btnAddNote').on('click', submitNote);
  $('.growth').hide();
  $('#btnShowGrowth').on('click', function(event){
    event.preventDefault();
    $('.growth').show();
  });

  // Delete Note link click
  $('#notelist').on('click', 'a.js-action-del', deleteNote);

  var userId= "535aea86ba44ef2c4ac8638e";
  buildGrowthHightchart(userId, "height", "cm");
  buildGrowthHightchart(userId, "weight", "kg");
});



function capitaliseFirstLetter(string)
{
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function buildGrowthHightchart(userId, type, unit) {
  $.getJSON( '/user/'+userId+'/growth/'+type, function( list ) {
    console.log(JSON.stringify(list));
    var data = new Array(list.length);
    for (var i in list) {
      data[i] = new Array(Math.ceil(list[i].days), list[i].value);
    }
    console.log(data);

    $('#'+type+'-growth-chart').highcharts({
      chart: {
        type: 'spline'
      },
      title: {
        text: capitaliseFirstLetter(type) + ' Growth'
      },
      xAxis: {
        labels: { formatter: function() { return this.value +''; } },
      },
      yAxis: {
        labels: { formatter: function() { return this.value +''; } },
        title: {
          enabled: false
        },
        lineWidth: 2
      },
      tooltip: { headerFormat: '<b>{series.name}</b><br/>', pointFormat: '{point.x} days: {point.y} '+ unit },
      series: [{
        name: capitaliseFirstLetter(type),
        data: data
      }]
    });

  });
}

// Functions =============================================================
//
// append/prepend notes to the notelist
function appendNotes(notes, append=true){
    $.each(notes, function(){
      var li = $("#note-item-templete").clone().attr("id","li-"+this._id).show();
      append ? li.appendTo("#notelist") : li.prependTo("#notelist");
      var content = this.noteContent;
      if (this.growth){
        if (this.growth.height)
          content += "</br>" + "Hight: " + this.growth.height;
        if (this.growth.weight)
          content += ", " + "Weight: " + this.growth.weight;
        if (this.growth.growthDate)
          content += ", " + "Date: " + this.growth.growthDate;
      }
      li.find("p").html(content);
      if(this.img){
        li.find(".note-img").attr("src", "/note/"+this._id+"/img").attr("height", "300").attr("width","400");
      }
      li.find(".time span").html(this.insertAt);
      li.find("a.js-action-del").attr("rel", this._id).attr("href", "#");

      noteCount += 1;
      $("span#noteCount").html(noteCount);
    });
}


// Fill table with data
function populateTable() {
  // jQuery AJAX call for JSON
  $.getJSON( '/notelist', function( notes ) {
    appendNotes(notes);
  });
};

function submitNote(event){
  event.preventDefault();
  var formData = new FormData(document.forms.namedItem("form-note"));
  $.ajax({
    type: 'POST',
    data: formData,
    url: '/addnote',
    processData: false,  // tell jQuery not to process the data
    contentType: false   // tell jQuery not to set contentType
  }).done(function( response ) {
    //alert(JSON.stringify(response));
    // Check for successful (blank) response
    if (response.msg) {
      // If something goes wrong, alert the error message that our service returned
      alert('Error: ' + response.msg);
    } else {
      // Clear the form inputs
      $('#noteContent').val('');
      // Update the table
      appendNotes(response, false);
    }
  });

}

// Delete Note
function deleteNote(event) {

  event.preventDefault();

  // Pop up a confirmation dialog
  var confirmation = true;//confirm('Are you sure you want to delete this note?');
  var noteId = $(this).attr('rel');
  // Check and make sure the user confirmed
  if (confirmation === true) {

    // If they did, do our delete
    $.ajax({
      type: 'DELETE',
      url: '/deletenote/' + noteId
    }).done(function( response ) {

      // Check for a successful (blank) response
      if (response.msg === '') {
      }
      else {
        alert('Error: ' + response.msg);
      }

      // Update the table
      $("#li-"+noteId).remove();
      noteCount -= 1;
      $("span#noteCount").html(noteCount);

    });

  }
  else {

    // If they said no to the confirm, do nothing
    return false;

  }

};

var formatDate = function(timeInMS) {
  return moment(timeInMS).format("HH:mm MM-DD-YYYY");
};
