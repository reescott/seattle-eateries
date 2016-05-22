function Eatery(eateryObject) {

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
var Eateries = function(){

};

var eateriesViewModel = function() {
    var self = this;
    self.currentEatery = ko.observable();

    self.getYelpData = function(){

      jQuery.ajax('api/getYelpBusiness.php', {
        data: { business: encodeURIComponent('Bar Cotto') }
        })
        .done(function (result) {
          console.log(result);
        });

    };
    self.getYelpData();
    // Eateries();
    // self.setEatery = function(index) {
    //   self.currentEatery = this.allEateries[index];
    // };

    // self.allEateries = ko.observableArray([
    //
    // ]);
};

ko.applyBindings(new eateriesViewModel());
