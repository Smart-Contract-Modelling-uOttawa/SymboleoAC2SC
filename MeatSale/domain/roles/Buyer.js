const { Role } = require("symboleo-js-core");

class Buyer extends Role {
  constructor(_name,warehouse,name) {
    super()
    this._name = _name
    this.warehouse = warehouse
    this.name = name
    this._type = "Buyer"
  }
}

module.exports.Buyer = Buyer
