/**
 * Eatery Processor class, builds and holds Eatery Objects
 * to make them available
 * to Knockout and Google Maps
 */
class Eateries {
  constructor() {
    this.rawData = this.getEateriesJSON();
    this.rawYelpData;
    this.data = [];
  }
  getEateriesJSON(){
    let that = this;
    let defaultMessage = 'Sorry! We could not locate the data. Please try again later.';

    jQuery.ajax('assets/js/src/data.json')
    .fail(function (response) {
      errorMessageHandler.displayError(defaultMessage);
    })
    .done(function (data) {
      console.log(data);
      if (data){
        try {
          that.rawData = data;
          that.buildEateriesArray();
        } catch(e) {
          console.log(e);
          errorMessageHandler.displayError('Sorry! Parsing Data failed. Please try again later.'); //error in the above string(in this case,yes)!
          return false;
        }
      } else {
        errorMessageHandler.displayError(defaultMessage);
      }
    });
  }
  buildEateriesArray() {
    let that = this;
    this.rawData.eateries.forEach(business => {
      that.getYelpData(business);
    });
  }
  buildEatery(business, eateryObject) {
    let that = this;
    that.data.push({
      'id': that.data.length,
      'name': ko.observable(eateryObject.name),
      'addressLine1': ko.observable(eateryObject.location.address[0]),
      'addressLine2': ko.observable(`${eateryObject.location.city}, ${eateryObject.location.state_code} ${eateryObject.location.postal_code}`),
      'website': ko.observable(business.website),
      'logoImage': ko.observable(business.logo),
      'rating': ko.observable(eateryObject.rating),
      'lat': ko.observable(eateryObject.location.coordinate.latitude),
      'long': ko.observable(eateryObject.location.coordinate.longitude),
      'isSelected': ko.observable(false)
    });

    //All data loaded
    if(that.data.length == that.rawData.eateries.length) {
      eateriesViewModel.init(); //Initialize viewModel
      theMapViewModel.plotMarkers();
    }
  }
  getYelpData(business) {
    let that = this;
    let defaultMessage = 'Sorry! Retrieving Yelp Data failed. Please try again later.';
    jQuery.ajax('api/getYelpBusiness.php', {
      data: { business: business.name }
    })
    .fail(function (response) {
      errorMessageHandler.displayError(defaultMessage);
    })
    .done(function (response) {
      console.log(response);
      if (response){
        let eateryJSON = {};
        try {
          eateryJSON = JSON.parse(response);
        } catch(e) {
          errorMessageHandler.displayError('Sorry! Parsing Yelp Data failed. Please try again later.'); //error in the above string(in this case,yes)!
          return false;
        }
        that.buildEatery(business, eateryJSON)
      } else {
        errorMessageHandler.displayError(defaultMessage);
      }
    });
  }
}

/**
 * Eateries View Model
 * @type {Object}
 */
var eateriesViewModel = {
  allEateries: ko.observableArray(),
  init: function () {
    let that = this;
    this.allEateries = ko.observableArray(eateriesObject.data);
    this.currentNameSearch = ko.observable("");

    this.filterEateries = ko.computed(function() {
      if(!that.currentNameSearch()) {
        return that.allEateries();
      } else {
        return ko.utils.arrayFilter(that.allEateries(), function(eatery) {
          //Matches any word that starts with string
          let regex = new RegExp("\\b" + that.currentNameSearch(), 'gi');
          return !(eatery.name().search(regex) == -1);
        });
      }
    });

    this.setCurrentEatery = function(eatery) {
      //Set eatery as selected
      that.allEateries().forEach(otherEatery => {
        if(otherEatery.id == eatery.id){
          otherEatery.isSelected(true);
        } else {
          otherEatery.isSelected(false);
        }
      });
      theMapViewModel.selectMarker(eatery.id);
    };

    ko.applyBindings(this, document.getElementById('Eateries'));
  }
};


/**
 * Map View Model
 * @credit: Some code borrowed from https://www.sitepoint.com/google-maps-javascript-api-the-right-way/
 */
class MapViewModel {
  constructor() {
    this.map;
    this.infoWindow = {};
    this.markers = [];
    this.bounds = {};
  }
  initMap(){
    this.map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: 47.606, lng: -122.332},
      zoom: 11,
      mapTypeControl: true,
      disableDefaultUI: true,
      zoomControl: true,
      scrollwheel: false,
      draggable : true
    });
  }
  plotMarkers() {
    let that = this;
    this.bounds = new google.maps.LatLngBounds();

    eateriesObject.data.forEach(function (marker, index) {
      let position = new google.maps.LatLng(marker.lat(), marker.long());

      that.markers.push(
        new google.maps.Marker({
          position: position,
          map: that.map,
          animation: google.maps.Animation.DROP,
          id: index
        })
      );

      that.bounds.extend(position);
    });

    this.map.fitBounds(this.bounds);
    this.map.setZoom(this.map.getZoom()-1);
    this.setupInfoWindow();
  }
  resetBounds() {
    let that = this;
    this.bounds = new google.maps.LatLngBounds();

    this.markers.forEach(function (marker, index) {
      that.bounds.extend(marker.position);
    });

    this.map.fitBounds(this.bounds);
  }
  selectMarker(index) {
    let that = this;
    this.infowindow.close();
    this.markers[index].setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function() {
      that.markers[index].setAnimation(null);
      that.showInfoWindow(index);
    }, 700);
    // this.resetBounds();
  }
  showInfoWindow(index) {
    let content = this.renderInfoWindowContent(index);
    this.infowindow.setContent(content)
    this.infowindow.open(this.map, this.markers[index]);
  }
  hideMarkers() {
    console.log('hello');
    console.log(eateriesObject.filterEateries);
    // marker.setMap(this.map);
    // marker.setMap(null);
  }
  setupInfoWindow() {
    let that = this;
    this.infowindow = new google.maps.InfoWindow({
      content: '<div>Hello there!</div>'
    });
    //Attach event listeners
    this.markers.forEach(function (marker, index) {
      marker.addListener('click', function() {
        let content = that.renderInfoWindowContent(index);
        that.infowindow.setContent(content)
        that.infowindow.open(that.map, marker);
      });
    });
  }
  renderInfoWindowContent(index) {
    let eateryObjectKO = eateriesObject.data[index];
    let eatery = {
      'name':         eateryObjectKO.name(),
      'addressLine1': eateryObjectKO.addressLine1(),
      'addressLine2': eateryObjectKO.addressLine2(),
      'website':      eateryObjectKO.website(),
      'logoImage':    eateryObjectKO.logoImage(),
      'rating':       eateryObjectKO.rating(),
      'lat':          eateryObjectKO.lat().toFixed(2),
      'long':         eateryObjectKO.long().toFixed(2)
    };
    //@see Template Literals: https://goo.gl/oH2hlN
    return `<section class="EateryInfoWindow">
              <h4> ${eatery.name} </h4>
              <address>
                ${eatery.addressLine1}<br>
                ${eatery.addressLine2}
              </address>
              <a href="${eatery.website}" title="Visit ${eatery.name} website">
                Visit ${eatery.name} website
              </a>
              <div>Rating: ${eatery.rating}</div>
              <div>Latitude/Longitude: ${eatery.lat}/${eatery.long}</div>
            </section>`;
  }
}

class ErrorMessageHandler {
  displayError(message) {
    console.log();
    // let errorMesssageDiv = document.querySelectorAll('#errorMessage');
    // errorMesssageDiv.innerHTML(message);
    $('#errorMessage').html(message);
    $('#errorModal').foundation('open');
  }
}


let eateriesObject = new Eateries();
var theMapViewModel = new MapViewModel();
let errorMessageHandler = new ErrorMessageHandler();
