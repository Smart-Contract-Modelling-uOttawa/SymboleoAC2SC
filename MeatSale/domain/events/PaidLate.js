const { Event } = require("symboleo-js-core");

class PaidLate extends Event {
  constructor(_name,amount, currency, from, to) {
    super()
    this._name = _name
    this.amount = amount
    this.currency = currency
    this.from = from
    this.to = to
    this._type = "PaidLate"

  }
}

module.exports.PaidLate = PaidLate
