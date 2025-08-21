const { Event } = require("symboleoac-js-core");
const { Attribute } = require("symboleoac-js-core");
class InspectedQuality extends Event {
 	constructor(_name,performer,quantityFound, qualityFound, barFound ) {
    super(performer)
    this._name = _name
    this._type = "InspectedQuality"
    this.quantityFound = new Attribute("quantityFound",quantityFound)
    this.qualityFound = new Attribute("qualityFound",qualityFound)
    this.barFound = new Attribute("barFound",barFound)
  }
}

module.exports.InspectedQuality = InspectedQuality
