'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Eatery Processor class, builds and holds Eatery Objects
 * to make them available
 * to Knockout and Google Maps
 */

var Eateries = function () {
  function Eateries() {
    _classCallCheck(this, Eateries);

    this.rawData = this.getEateriesJSON();
    this.rawYelpData;
    this.data = [];
  }

  _createClass(Eateries, [{
    key: 'getEateriesJSON',
    value: function getEateriesJSON() {
      var that = this;
      jQuery.ajax('assets/js/src/data.json').done(function (data) {
        that.rawData = JSON.parse(data);
        that.buildEateriesArray();
      });
    }
  }, {
    key: 'buildEateriesArray',
    value: function buildEateriesArray() {
      var that = this;
      this.rawData.eateries.forEach(function (business) {
        that.getYelpData(business);
      });
    }
  }, {
    key: 'buildEatery',
    value: function buildEatery(business, eateryObject) {
      var that = this;
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
      if (that.data.length == that.rawData.eateries.length) {
        eateriesViewModel.init(); //Initialize viewModel
        theMapViewModel.plotMarkers();
      }
    }
  }, {
    key: 'getYelpData',
    value: function getYelpData(business) {
      var that = this;
      jQuery.ajax('api/getYelpBusiness.php', {
        data: { business: business.name }
      }).done(function (eateryObject) {
        that.buildEatery(business, JSON.parse(eateryObject));
      });
    }
  }]);

  return Eateries;
}();

/**
 * Eateries View Model
 * @type {Object}
 */


var eateriesViewModel = {
  allEateries: ko.observableArray(),
  init: function init() {
    eateriesViewModel.allEateries = ko.observableArray(eateriesObject.data);
    ko.applyBindings(eateriesViewModel, document.getElementById('Eateries'));
  }
};

/**
 * Map View Model
 * @credit: Some code borrowed from https://www.sitepoint.com/google-maps-javascript-api-the-right-way/
 */

var MapViewModel = function () {
  function MapViewModel() {
    _classCallCheck(this, MapViewModel);

    this.map;
    this.markers = [];
    this.bounds = {};
  }

  _createClass(MapViewModel, [{
    key: 'initMap',
    value: function initMap() {
      this.map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 47.606, lng: -122.332 },
        zoom: 11
      });
    }
  }, {
    key: 'plotMarkers',
    value: function plotMarkers() {
      var that = this;
      this.bounds = new google.maps.LatLngBounds();

      eateriesObject.data.forEach(function (marker) {
        var position = new google.maps.LatLng(marker.lat(), marker.long());

        that.markers.push(new google.maps.Marker({
          position: position,
          map: that.map,
          animation: google.maps.Animation.DROP
        }));

        that.bounds.extend(position);
      });

      this.map.fitBounds(this.bounds);
    }
  }]);

  return MapViewModel;
}();

var eateriesObject = new Eateries();
var theMapViewModel = new MapViewModel();