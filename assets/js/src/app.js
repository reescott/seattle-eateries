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
    jQuery.ajax('assets/js/src/data.json')
    .done(function (data) {
      that.rawData = JSON.parse(data);
      that.buildEateriesArray();
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
      'name': ko.observable(eateryObject.name),
      'addressLine1': ko.observable(eateryObject.location.address[0]),
      'addressLine2': ko.observable(eateryObject.location.city),
      'website': ko.observable(business.website),
      'logoImage': ko.observable(business.logo),
      'rating': ko.observable(eateryObject.rating),
      'lat': ko.observable(eateryObject.location.coordinate.latitude),
      'long': ko.observable(eateryObject.location.coordinate.longitude)
    });

    //All data loaded
    if(that.data.length == that.rawData.eateries.length) {
      eateriesViewModel.init(); //Initialize viewModel
      theMapViewModel.plotMarkers();
    }
  }
  getYelpData(business) {
    let that = this;
    jQuery.ajax('api/getYelpBusiness.php', {
      data: { business: business.name }
    })
    .done(function (eateryObject) {
      that.buildEatery(business, JSON.parse(eateryObject));
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
    eateriesViewModel.allEateries = ko.observableArray(eateriesObject.data);
    ko.applyBindings(eateriesViewModel, document.getElementById('Eateries'));
  }
};


/**
 * Map View Model
 * @credit: Some code borrowed from https://www.sitepoint.com/google-maps-javascript-api-the-right-way/
 */
class MapViewModel {
  constructor() {
    this.map;
    this.markers = [];
    this.bounds = {};
  }
  initMap(){
    this.map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: 47.606, lng: -122.332},
      zoom: 11
    });
  }
  plotMarkers() {
    let that = this;
    this.bounds = new google.maps.LatLngBounds();
    
    eateriesObject.data.forEach(function (marker) {
      let position = new google.maps.LatLng(marker.lat(), marker.long());

      that.markers.push(
        new google.maps.Marker({
          position: position,
          map: that.map,
          animation: google.maps.Animation.DROP
        })
      );

      that.bounds.extend(position);
    });

    this.map.fitBounds(this.bounds);
  }
}


let eateriesObject = new Eateries();
var theMapViewModel = new MapViewModel();
