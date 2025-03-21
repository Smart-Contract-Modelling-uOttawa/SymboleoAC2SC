const { Event } = require("symboleo-js-core");

class Disclosed extends Event {
  constructor(_name,) {
    super()
    this._name = _name
    this._type = "Disclosed"
  }
}

module.exports.Disclosed = Disclosed
