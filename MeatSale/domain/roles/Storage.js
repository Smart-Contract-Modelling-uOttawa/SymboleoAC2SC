const { Role } = require("symboleoac-js-core");
const { Attribute } = require("symboleoac-js-core");

class Storage extends Role {
  constructor(_name,address,org, dept) {
    super()
    this._name = _name
    this._type = "Storage"
    this.address = new Attribute("address",address)
         /** */
    this.org = new Attribute("org",org)
    this.dept = new Attribute("dept",dept)
  }
}

module.exports.Storage = Storage
