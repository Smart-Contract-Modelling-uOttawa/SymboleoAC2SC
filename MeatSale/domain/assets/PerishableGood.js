const { Asset } = require("symboleo-js-core");
const { Attribute } = require("/Users/sfuhaid/Symboleo2SC-demo-mainFunctionACcore/node_modules/symboleo-js-core/core/Attribute.js");
//Sofana-AC add _owner for controller
/**code genration add  */
class PerishableGood extends Asset {
  constructor(_name,owner,quantity, quality) {
    super(_name,owner)
    this._name = _name
    //this._owners = owner
    //this.quantity = quantity
    //this.quality = quality
    //new enhancment for AC when we add attribute as a class extendes from Resource
    this._owners = new Attribute("owner",owner,_name);  
    this.quantity = new Attribute("quantity",quantity,_name); 
    this.quality = new Attribute("quality",quality,_name); 
  }
}

module.exports.PerishableGood = PerishableGood
