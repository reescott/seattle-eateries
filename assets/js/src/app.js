class Eatery {
  constructor(eateryObject) {
    this.name = ko.observable(eateryObject.newName);
    this.addressLine1 = ko.observable(eateryObject.newAddressLine1);
    this.addressLine2 = ko.observable(eateryObject.newAddressLine2);
    this.website = eateryObject.website;
    this.logoImage = ko.observable(eateryObject.newLogo);
    this.rating = ko.observable(eateryObject.newRating);
    this.lat = ko.observable(eateryObject.newLat);
    this.long = ko.observable(eateryObject.newLong);

    this.fullAddress = ko.computed(function() {
      return this.addressLine1() + ", " + this.addressLine2();
    }, this);
  }
}

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
    eateriesViewModel.setupVars();
    startApp();
  }
  buildEatery(business, eateryObject) {
    let that = this;
    that.data.push(
      new Eatery({
        "newName": eateryObject.name,
        "newAddressLine1": eateryObject.location.address,
        "newAddressLine2": eateryObject.location.city +
        ', ' + eateryObject.location.state_code +
        ' '  + eateryObject.location.postal_code,
        "website": business.website,
        "newLogo": business.logo,
        "newRating": eateryObject.rating,
        "newLat": eateryObject.location.coordinate.latitude,
        "newLat": eateryObject.location.coordinate.longitude
      })
    );
  }
  getYelpData(business) {
    let that = this;
    let result = {};
    jQuery.ajax('api/getYelpBusiness.php', {
      data: { business: business.name }
    })
    .done(function (eateryObject) {
      that.buildEatery(business, JSON.parse(eateryObject));
    });
  }
}

let eateriesViewModel = {
  init: function() {
    this.Eateries = new Eateries();
  },
  setupVars: function() {
    this.currentEatery = ko.observable(this.Eateries.data[0]);
    this.allEateries = ko.observableArray(this.Eateries.data);
    console.log(this.Eateries.data);
  }
};

let startApp = function () {
  ko.applyBindings(eateriesViewModel);
  console.log(eateriesViewModel);
};

eateriesViewModel.init();
