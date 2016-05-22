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

    if(that.data.length == that.rawData.eateries.length) {
      startApp();
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

var eateriesViewModel = {
  allEateries: ko.observableArray()
};

let EateriesObject = new Eateries();

let startApp = function () {
  eateriesViewModel.allEateries = ko.observableArray(EateriesObject.data);
  ko.applyBindings(eateriesViewModel, document.getElementById('Eateries'));
};
