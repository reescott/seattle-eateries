'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// let Eatery = {
//     this.name = ko.observable(eateryObject.newName);
//     this.addressLine1 = ko.observable(eateryObject.newAddressLine1);
//     this.addressLine2 = ko.observable(eateryObject.newAddressLine2);
//     this.website = eateryObject.website;
//     this.logoImage = ko.observable(eateryObject.newLogo);
//     this.rating = ko.observable(eateryObject.newRating);
//     this.lat = ko.observable(eateryObject.newLat);
//     this.long = ko.observable(eateryObject.newLong);
// };

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

      if (that.data.length == that.rawData.eateries.length) {
        startApp();
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

var eateriesViewModel = {
  allEateries: ko.observableArray()
};

var EateriesObject = new Eateries();

var startApp = function startApp() {
  eateriesViewModel.allEateries = ko.observableArray(EateriesObject.data);
  ko.applyBindings(eateriesViewModel, document.getElementById('Eateries'));
};