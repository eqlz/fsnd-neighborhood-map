var map;

var markers = [];

function initMap() {
  // create map
  map = new google.maps.Map(document.getElementById('map'), {
  center: {lat: 43.766874, lng: -79.386304},
  zoom: 12});

  // create a list of stations
  stations = [
    {title: "Sheppard-Yonge Station", location: {lat: 43.74969189999999, lng: -79.46189889999999}},
    {title: "Bayview Station", location: {lat: 43.766874, lng: -79.38630379999999}},
    {title: "Bessarion Station", location: {lat: 43.7693153, lng: -79.375974}},
    {title: "Leslie Station", location: {lat: 43.770847, lng: -79.36779}},
    {title: "Don Mills Station", location: {lat: 43.7754473, lng: -79.34561529999999}}
  ];

  // create Info Window
  var infoWindow = new google.maps.InfoWindow();

  // create markers 
  for (var i = 0; i < stations.length; i++) {
    // Get position and title from stations array
    var position = stations[i].location;
    var title = stations[i].title;
    
    // create a marker for each station
    var marker = new google.maps.Marker({
      map: map,
      position: position,
      title: title,
      animation: google.maps.Animation.DROP,
    });
    
    // push each marker into markers array
    markers.push(marker);

    // create an event when a marker is clicked, an info window will pop out
    // and the marker will bounce
    marker.addListener('click', function() {
      populateInfoWindow(this);
      this.setAnimation(google.maps.Animation.BOUNCE);
    });

    // create an event when the mouse moves away from a marker, the marker will
    // stop bounce
    marker.addListener('mouseout', function() {
      this.setAnimation(null);
    });
  }

  // filter out list based on input that is typed in
  document.getElementById('go-filter').addEventListener('click', function() {
    filterList();
  });

  // create a ViewModel 
  var viewModel = function() {
    var self = this;

    // create an observableArray, stationList
    this.stationList = ko.observableArray([]);
    
    // put each marker in array markers into observableArray stationList
    markers.forEach(function(stationItem) {
      self.stationList.push(stationItem);
    });

    // create an info windown when a station item in the list view is clicked
    this.populateInfoWindow = function(marker) {
      var infoWindow = new google.maps.InfoWindow();
    
      // create URL that is for wikipedia API call
      var stationStr = marker.title.replace(/ /g, "+");
      var wikiUrl = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' +
          stationStr + '&format=json&callback=wikiCallback';

      // make ajax call to retrieve information from wikipedia
      $.ajax({
        url: wikiUrl,
        dataType: "jsonp",
        success: function(response) {
          var stationName = response[1][0];
          var url = 'https://en.wikipedia.org/wiki/' + stationName;
          infoWindow.setContent('<div>' + marker.title + '</div>'
              + '<br>'
              + '<a href="' + url + '">' + stationName + '</a>');            
        },
        error: function(request, status, error) {
          if(request.status == 400) {
            alert(request.responseTest);
          } else {
            alert("Sorry, something is wrong here.");
          }
        }
      });
      
      // the maker will bounce when the corresponding station in list view is clicked
      marker.setAnimation(google.maps.Animation.BOUNCE);
      
      infoWindow.open(map, marker);
      
      // create an when the mouse is moved to marker, the marker will stop bouncing
      marker.addListener('mouseover', function() {
        this.setAnimation(null);
      });   
    };
  };

  ko.applyBindings(new viewModel());
}

// this function will populate the info window when a marker is clicked
function populateInfoWindow(marker) {
  var infoWindow = new google.maps.InfoWindow();
  
  // create URL for wikipedia API call
  var stationStr = marker.title.replace(/ /g, "+");
  var wikiUrl = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' +
      stationStr + '&format=json&callback=wikiCallback';

  // make an ajax call to retrieve information from wikipedia
  $.ajax({
    url: wikiUrl,
    dataType: "jsonp",
    success: function(response) {
      var stationName = response[1][0];
      var url = 'https://en.wikipedia.org/wiki/' + stationName;
      infoWindow.setContent('<div>' + marker.title + '</div>'
          + '<br>'
          + '<a href="' + url + '">' + stationName + '</a>');            
    },
    error: function(request, status, error) {
      if(request.status == 400) {
        alert(request.responseTest);
      } else {
        alert("Sorry, something went wrong");
      }
    }
  });

  infoWindow.open(map, marker);
}

// this function filter the list, show the station based on user's input 
function filterList() {
  var input, filter, ul, li, i, j;
  
  // get the input you type in
  input = document.getElementById('stations-filter');
  
  // turn all characters of input into uppercase
  filter = input.value.toUpperCase();
  
  // retrieve <ul> element with id "stations-list"
  ul = document.getElementById('stations-list');
  
  // retrieve all <li> elements nested in the above <ul> element
  li = ul.getElementsByTagName('li');

  // loop through all <li> elements, show those match the search query,
  // hide those that don't match the search query
  for (i = 0; i < li.length; i++) {
    
    // get the station name of each <li> represents
    stationName = li[i].innerHTML
    
    // turn station name into uppercase
    stationNameUpperCase = stationName.toUpperCase();
    
    // when user's input can be found matching the name of this station
    if (stationNameUpperCase.indexOf(filter) > -1) {
      
      // keep <li> representing this station
      li[i].style.display = '';
      
      // loop through all markers, show the marker representing this station
      for (j = 0; j < markers.length; j++) {
        if (stationName == markers[j].title) {
          markers[j].setMap(map);
        }
      }                      
    } else { // when user's input can't be found matching the name of this station
      
      // hide <li> representing this station
      li[i].style.display = "none";
      
      // loop through all markers, hide the marker representing this station
      for (j = 0; j < markers.length; j++) {
        if (stationName == markers[j].title) {
          markers[j].setMap(null);
        }
      }            
    }
  }
}