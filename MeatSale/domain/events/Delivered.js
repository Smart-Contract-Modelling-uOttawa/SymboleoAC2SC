const { Event } = require("symboleo-js-core");
const { Attribute } = require("/Users/sfuhaid/Symboleo2SC-demo-mainFunctionACcore/node_modules/symboleo-js-core/core/Attribute.js");
//*** all attributes that comes from domain need to be updated and created as instance from class attribute
//Sofana-AC add performer
class Delivered extends Event {
  //***change order of element 
  constructor(_name,performer, item, deliveryAddress, delDueDate,temp) {
    super(performer)
    //this.performer= []
    //***here either addperformer or add if to check if the performer is embty or not
    //this.addPerformer(performer)
    this._name = _name
    this.item = new Attribute("item",item) 
    this.deliveryAddress = new Attribute("deliveryAddress",deliveryAddress) 
    this.delDueDate = new Attribute("delDueDate",delDueDate) 
    this.temperature = new Attribute("temperature", temp) 
    this._type = "Delivered"
  }
}

module.exports.Delivered = Delivered
