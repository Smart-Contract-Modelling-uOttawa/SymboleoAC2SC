const { Asset } = require("symboleoac-js-core");
const { Attribute } = require("symboleoac-js-core");

class PerishableGood extends Asset {
  constructor(_name,quantity, quality, barcode, owner) {
    super(owner)
    this._name = _name
    this._type = "PerishableGood"
    this.quantity = new Attribute("quantity",quantity)
    this.quality = new Attribute("quality",quality)
    this.barcode = new Attribute("barcode",barcode)
  }
}

module.exports.PerishableGood = PerishableGood
