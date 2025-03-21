const { Event } = require("symboleo-js-core");
const { Attribute } = require("/Users/sfuhaid/Symboleo2SC-demo-mainFunctionACcore/node_modules/symboleo-js-core/core/Attribute.js");

class Paid extends Event {
  constructor(_name,performer,amount, currency, from, to, payDueDate) {
    super(performer)
    this._name = _name
    this.amount = new Attribute("amount", amount)
    this.currency = new Attribute("currency",currency)
    this.from = new Attribute("from", from)
    this.to = new Attribute("from",to)
    this.payDueDate = new Attribute("payDueDate", payDueDate)
    this._type = "Paid"

  }
}

module.exports.Paid = Paid

