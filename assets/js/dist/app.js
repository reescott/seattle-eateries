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
      var defaultMessage = 'Sorry! We could not locate the data. Please try again later.';

      jQuery.ajax('assets/js/src/data.json').fail(function (response) {
        errorMessageHandler.displayError(defaultMessage);
      }).done(function (data) {
        if (data) {
          try {
            that.rawData = JSON.parse(data);
            that.buildEateriesArray();
          } catch (e) {
            errorMessageHandler.displayError('Sorry! Parsing Data failed. Please try again later.'); //error in the above string(in this case,yes)!
            return false;
          }
        } else {
          errorMessageHandler.displayError(defaultMessage);
        }
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
        'id': that.data.length,
        'name': ko.observable(eateryObject.name),
        'addressLine1': ko.observable(eateryObject.location.address[0]),
        'addressLine2': ko.observable(eateryObject.location.city + ', ' + eateryObject.location.state_code + ' ' + eateryObject.location.postal_code),
        'website': ko.observable(business.website),
        'logoImage': ko.observable(business.logo),
        'rating': ko.observable(eateryObject.rating),
        'lat': ko.observable(eateryObject.location.coordinate.latitude),
        'long': ko.observable(eateryObject.location.coordinate.longitude),
        'isSelected': ko.observable(false)
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
      var defaultMessage = 'Sorry! Retrieving Yelp Data failed. Please try again later.';
      jQuery.ajax('api/getYelpBusiness.php', {
        data: { business: business.name }
      }).fail(function (response) {
        errorMessageHandler.displayError(defaultMessage);
      }).done(function (response) {
        if (response) {
          var eateryJSON = {};
          try {
            eateryJSON = JSON.parse(response);
          } catch (e) {
            errorMessageHandler.displayError('Sorry! Parsing Yelp Data failed. Please try again later.'); //error in the above string(in this case,yes)!
            return false;
          }
          that.buildEatery(business, eateryJSON);
        } else {
          errorMessageHandler.displayError(defaultMessage);
        }
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
    var that = this;
    this.allEateries = ko.observableArray(eateriesObject.data);
    this.currentNameSearch = ko.observable("");

    this.filterEateries = ko.computed(function () {
      if (!that.currentNameSearch()) {
        return that.allEateries();
      } else {
        return ko.utils.arrayFilter(that.allEateries(), function (eatery) {
          //Matches any word that starts with string
          var regex = new RegExp("\\b" + that.currentNameSearch(), 'gi');
          return !(eatery.name().search(regex) == -1);
        });
      }
    });

    this.setCurrentEatery = function (eatery) {
      //Set eatery as selected
      that.allEateries().forEach(function (otherEatery) {
        if (otherEatery.id == eatery.id) {
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

var MapViewModel = function () {
  function MapViewModel() {
    _classCallCheck(this, MapViewModel);

    this.map;
    this.infoWindow = {};
    this.markers = [];
    this.bounds = {};
  }

  _createClass(MapViewModel, [{
    key: 'initMap',
    value: function initMap() {
      this.map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 47.606, lng: -122.332 },
        zoom: 11,
        mapTypeControl: true,
        disableDefaultUI: true,
        zoomControl: true,
        scrollwheel: false,
        draggable: true
      });
    }
  }, {
    key: 'plotMarkers',
    value: function plotMarkers() {
      var that = this;
      this.bounds = new google.maps.LatLngBounds();

      eateriesObject.data.forEach(function (marker, index) {
        var position = new google.maps.LatLng(marker.lat(), marker.long());

        that.markers.push(new google.maps.Marker({
          position: position,
          map: that.map,
          animation: google.maps.Animation.DROP,
          id: index
        }));

        that.bounds.extend(position);
      });

      this.map.fitBounds(this.bounds);
      this.map.setZoom(this.map.getZoom() - 1);
      this.setupInfoWindow();
    }
  }, {
    key: 'resetBounds',
    value: function resetBounds() {
      var that = this;
      this.bounds = new google.maps.LatLngBounds();

      this.markers.forEach(function (marker, index) {
        that.bounds.extend(marker.position);
      });

      this.map.fitBounds(this.bounds);
    }
  }, {
    key: 'selectMarker',
    value: function selectMarker(index) {
      var that = this;
      this.infowindow.close();
      this.markers[index].setAnimation(google.maps.Animation.BOUNCE);
      setTimeout(function () {
        that.markers[index].setAnimation(null);
        that.showInfoWindow(index);
      }, 700);
      // this.resetBounds();
    }
  }, {
    key: 'showInfoWindow',
    value: function showInfoWindow(index) {
      var content = this.renderInfoWindowContent(index);
      this.infowindow.setContent(content);
      this.infowindow.open(this.map, this.markers[index]);
    }
  }, {
    key: 'hideMarkers',
    value: function hideMarkers() {
      console.log('hello');
      console.log(eateriesObject.filterEateries);
      // marker.setMap(this.map);
      // marker.setMap(null);
    }
  }, {
    key: 'setupInfoWindow',
    value: function setupInfoWindow() {
      var that = this;
      this.infowindow = new google.maps.InfoWindow({
        content: '<div>Hello there!</div>'
      });
      //Attach event listeners
      this.markers.forEach(function (marker, index) {
        marker.addListener('click', function () {
          var content = that.renderInfoWindowContent(index);
          that.infowindow.setContent(content);
          that.infowindow.open(that.map, marker);
        });
      });
    }
  }, {
    key: 'renderInfoWindowContent',
    value: function renderInfoWindowContent(index) {
      var eateryObjectKO = eateriesObject.data[index];
      var eatery = {
        'name': eateryObjectKO.name(),
        'addressLine1': eateryObjectKO.addressLine1(),
        'addressLine2': eateryObjectKO.addressLine2(),
        'website': eateryObjectKO.website(),
        'logoImage': eateryObjectKO.logoImage(),
        'rating': eateryObjectKO.rating(),
        'lat': eateryObjectKO.lat().toFixed(2),
        'long': eateryObjectKO.long().toFixed(2)
      };
      //@see Template Literals: https://goo.gl/oH2hlN
      return '<section class="EateryInfoWindow">\n              <h4> ' + eatery.name + ' </h4>\n              <address>\n                ' + eatery.addressLine1 + '<br>\n                ' + eatery.addressLine2 + '\n              </address>\n              <a href="' + eatery.website + '" title="Visit ' + eatery.name + ' website">\n                Visit ' + eatery.name + ' website\n              </a>\n              <div>Rating: ' + eatery.rating + '</div>\n              <div>Latitude/Longitude: ' + eatery.lat + '/' + eatery.long + '</div>\n            </section>';
    }
  }]);

  return MapViewModel;
}();

var ErrorMessageHandler = function () {
  function ErrorMessageHandler() {
    _classCallCheck(this, ErrorMessageHandler);
  }

  _createClass(ErrorMessageHandler, [{
    key: 'displayError',
    value: function displayError(message) {
      console.log();
      // let errorMesssageDiv = document.querySelectorAll('#errorMessage');
      // errorMesssageDiv.innerHTML(message);
      $('#errorMessage').html(message);
      $('#errorModal').foundation('open');
    }
  }]);

  return ErrorMessageHandler;
}();

var eateriesObject = new Eateries();
var theMapViewModel = new MapViewModel();
var errorMessageHandler = new ErrorMessageHandler();