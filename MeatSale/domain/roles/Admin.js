const { Role } = require("symboleoac-js-core");
const { Attribute } = require("symboleoac-js-core");

class Admin extends Role {
  constructor(_name,name, org, dept) {
    super()
    this._name = _name
    this._type = "Admin"
    this.name = new Attribute("name",name)
    //** */
    this.org = new Attribute("org",org)
    this.dept = new Attribute("dept",dept)
  }
}

module.exports.Admin = Admin
