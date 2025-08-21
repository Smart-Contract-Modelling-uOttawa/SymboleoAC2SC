const { Event } = require("symboleoac-js-core");
const { Attribute } = require("symboleoac-js-core");
class UnLoaded extends Event {
 	constructor(_name,performer, ) {
    super(performer)
    this._name = _name
    this._type = "UnLoaded"
  }
}

module.exports.UnLoaded = UnLoaded
