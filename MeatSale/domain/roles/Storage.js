const { Role } = require("symboleo-js-core");

class Storage extends Role {
  constructor(_name,name) {
    super()
    this._name = _name
    //this.warehouse = warehouse
    this.name = name
    this._type = "Storage"
  }
}

module.exports.Storage = Storage