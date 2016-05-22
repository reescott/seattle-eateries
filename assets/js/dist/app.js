"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Eatery = function Eatery(eateryObject) {
  _classCallCheck(this, Eatery);

  this.name = ko.observable(eateryObject.newName);
  this.addressLine1 = ko.observable(eateryObject.newAddressLine1);
  this.addressLine2 = ko.observable(eateryObject.newAddressLine2);
  this.website = eateryObject.website;
  this.logoImage = ko.observable(eateryObject.newLogo);
  this.rating = ko.observable(eateryObject.newRating);
  this.lat = ko.observable(eateryObject.newLat);
  this.long = ko.observable(eateryObject.newLong);

  this.fullAddress = ko.computed(function () {
    return this.addressLine1() + ", " + this.addressLine2();
  }, this);
};

var Eateries = function () {
  function Eateries() {
    _classCallCheck(this, Eateries);

    this.rawData = this.getEateriesJSON();
    this.rawYelpData;
    this.data = [];
  }

  _createClass(Eateries, [{
    key: "getEateriesJSON",
    value: function getEateriesJSON() {
      var that = this;
      jQuery.ajax('assets/js/src/data.json').done(function (data) {
        that.rawData = JSON.parse(data);
        that.buildEateriesArray();
      });
    }
  }, {
    key: "buildEateriesArray",
    value: function buildEateriesArray() {
      var that = this;
      this.rawData.eateries.forEach(function (business) {
        that.getYelpData(business);
      });
      eateriesViewModel.setupVars();
      startApp();
    }
  }, {
    key: "buildEatery",
    value: function buildEatery(business, eateryObject) {
      var that = this;
      that.data.push(new Eatery(_defineProperty({
        "newName": eateryObject.name,
        "newAddressLine1": eateryObject.location.address,
        "newAddressLine2": eateryObject.location.city + ', ' + eateryObject.location.state_code + ' ' + eateryObject.location.postal_code,
        "website": business.website,
        "newLogo": business.logo,
        "newRating": eateryObject.rating,
        "newLat": eateryObject.location.coordinate.latitude
      }, "newLat", eateryObject.location.coordinate.longitude)));
    }
  }, {
    key: "getYelpData",
    value: function getYelpData(business) {
      var that = this;
      var result = {};
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
  init: function init() {
    this.Eateries = new Eateries();
  },
  setupVars: function setupVars() {
    this.currentEatery = ko.observable(this.Eateries.data[0]);
    this.allEateries = ko.observableArray(this.Eateries.data);
    console.log(this.Eateries.data);
  }
};

var startApp = function startApp() {
  ko.applyBindings(eateriesViewModel);
  console.log(eateriesViewModel);
};

eateriesViewModel.init();