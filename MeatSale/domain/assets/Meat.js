const { PerishableGood } = require("./PerishableGood.js");
const { Attribute } = require("symboleoac-js-core");

class Meat extends PerishableGood {
  constructor(_name,quantity, quality, barcode, owner) {
    super(_name,quantity, quality, barcode, owner)
    this._type = "Meat"
    
  }
}

module.exports.Meat = Meat
