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

    new google.maps.event.trigger(marker, 'click');

    // call function, markerClickEven where a marker is clicked, an info window will pop out
    // and the marker will bounce
    markerClickEvent(marker, infoWindow);    
  }

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
    this.populateInfoWindowKo = function(marker) {
      new google.maps.event.trigger(marker, 'click');
      markerClickEvent(marker, infoWindow);
    };

    this.query = ko.observable("");

    // filter the list based on user input
    /*self.stationListFiltered = ko.computed(function() {
      var query = self.query().toLowerCase();
      if(!query) {
        return self.stationList();
      } else {
        return ko.utils.arrayFilter(self.stationList(), function(station) {
          console.log(station.title);
          station.setMap(map);
          return station.title.toLowerCase().startsWith(query);
        });
      }
    });*/

    // create a temporary observableArray
    this.stationListTemp = ko.observableArray([]);

    self.stationListFiltered = ko.computed(function() {
      var query = self.query().toLowerCase();
      if(!query) {
        self.stationList().forEach(function(station) {
          station.setMap(map);
        });
        return self.stationList();
      } else {
        // empty stationListTemp before looping through stationList
        self.stationListTemp([]);
        self.stationList().forEach(function(station) {
          // if the query matches any station's title
          if (station.title.toLowerCase().startsWith(query)) {
            self.stationListTemp().push(station);
            station.setMap(map);
          }
          else {
            station.setMap(null);
          }
        });
        return self.stationListTemp();
      }
    });   
  
  };

  ko.applyBindings(new viewModel()); 
}

// this function handles error related to Google Maps API
function googleMapsError() {
    alert("Sorry, not able to load the map");
};

// this function will populate an info window and make a marker bounce when
// a marker is clicked
function markerClickEvent(marker, infowindow) {
  marker.addListener('click', function() {
    var self = this;
    populateInfoWindow(this, infowindow);
    self.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function(){self.setAnimation(null);}, 2 * 750);
  });
};

// this function will populate the info window when a marker is clicked
function populateInfoWindow(marker, infowindow) { 
  // create URL for wikipedia API call
  var stationStr = marker.title.replace(/ /g, "+");
  var wikiUrl = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' +
      stationStr + '&format=json&callback=wikiCallback';

  // make an ajax call to retrieve information from wikipedia
  $.ajax({
    url: wikiUrl,
    dataType: "jsonp"
  })
    .done(function(response) {
      var stationName = response[1][0];
      var url = 'https://en.wikipedia.org/wiki/' + stationName;
      infowindow.setContent('<div>' + marker.title + '</div>' + '<br>' + '<a href="' + url + '">' + stationName + '</a>');            
    })
    .fail(function(request, status, error) {
      if(request.status == 400) {
        alert(request.responseTest);
      } else {
        alert("Sorry, something went wrong");
      }
    })

  infowindow.open(map, marker);
};
