const { Event } = require("symboleoac-js-core");
const { Attribute } = require("symboleoac-js-core");
class PasswordNotification extends Event {
 	constructor(_name,performer,pin ) {
    super(performer)
    this._name = _name
    this._type = "PasswordNotification"
    this.pin = new Attribute("pin",pin)
  }
}

module.exports.PasswordNotification = PasswordNotification
