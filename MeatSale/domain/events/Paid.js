const { Event } = require("symboleoac-js-core");
const { Attribute } = require("symboleoac-js-core");
class Paid extends Event {
 	constructor(_name,performer,amount, currency, from, to, payDueDate ) {
    super(performer)
    this._name = _name
    this._type = "Paid"
    this.amount = new Attribute("amount",amount)
    this.currency = new Attribute("currency",currency)
    this.from = new Attribute("from",from)
    this.to = new Attribute("to",to)
    this.payDueDate = new Attribute("payDueDate",payDueDate)
  }
}

module.exports.Paid = Paid
