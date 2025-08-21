const { Event } = require("symboleoac-js-core");
const { Attribute } = require("symboleoac-js-core");
class PaidLate extends Event {
 	constructor(_name,performer,amount, currency, from, to ) {
    super(performer)
    this._name = _name
    this._type = "PaidLate"
    this.amount = new Attribute("amount",amount)
    this.currency = new Attribute("currency",currency)
    this.from = new Attribute("from",from)
    this.to = new Attribute("to",to)
  }
}

module.exports.PaidLate = PaidLate
