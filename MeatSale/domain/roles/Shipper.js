const { Role } = require("symboleo-js-core");

class Shipper extends Role {
  constructor(_name,name,job) {
    super()
    this._name = _name
    this.name = name
    this.job = job
    this._type = "Shipper"
  }
}

module.exports.Shipper = Shipper