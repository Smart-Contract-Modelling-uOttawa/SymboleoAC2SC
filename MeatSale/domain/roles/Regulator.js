const { Role } = require("symboleo-js-core");

class Regulator extends Role {
  constructor(_name,returnAddress, name) {
    super()
    this._name = _name
    this.returnAddress = returnAddress
    this.name = name
    this._type = "Regulator"
  }
}

module.exports.Regulator = Regulator
