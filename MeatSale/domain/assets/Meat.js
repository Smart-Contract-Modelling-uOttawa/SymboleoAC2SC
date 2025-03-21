const { PerishableGood } = require("./PerishableGood.js");
//Sofana-AC add _owner for controller
class Meat extends PerishableGood {
  constructor(_name,owner,quantity, quality) {
    super(_name,owner,quantity, quality)
    this._type = "Meat"

  }
}

module.exports.Meat = Meat
