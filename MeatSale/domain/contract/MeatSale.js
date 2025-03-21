const { PerishableGood } = require("../assets/PerishableGood.js")
const { Meat } = require("../assets/Meat.js")
const { Delivered } = require("../events/Delivered.js")
//sofana
const { Notified } = require("../events/Notified.js")
//sofana
const { Paid } = require("../events/Paid.js")
const { PaidLate } = require("../events/PaidLate.js")
const { Disclosed } = require("../events/Disclosed.js")
const { Seller } = require("../roles/Seller.js")
const { Buyer } = require("../roles/Buyer.js")
//CA
const { Regulator } = require("../roles/Regulator.js")
const { Storage } = require("../roles/Storage.js")
const { Shipper } = require("../roles/Shipper.js")
//AC
//const { LegalSituation } = require("symboleo-js-core")
const { Currency } = require("../types/Currency.js")
const { MeatQuality } = require("../types/MeatQuality.js")
const { SymboleoContract } = require("symboleo-js-core")
const { Obligation } = require("symboleo-js-core")
const { Power } = require("symboleo-js-core")
const { Utils } = require("symboleo-js-core")
const { Str } = require("symboleo-js-core")

//AC
const { ACPolicy } = require("/Users/sfuhaid/Symboleo2SC-demo-mainFunctionACcore/node_modules/symboleo-js-core/core/ACPolicy.js")
const { Attribute } = require("/Users/sfuhaid/Symboleo2SC-demo-mainFunctionACcore/node_modules/symboleo-js-core/core/Attribute.js")
const { Rule } = require("/Users/sfuhaid/Symboleo2SC-demo-mainFunctionACcore/node_modules/symboleo-js-core/core/Rule.js")
const { LegalSituation } = require("/Users/sfuhaid/Symboleo2SC-demo-mainFunctionACcore/node_modules/symboleo-js-core/core/LegalSituation.js")
const { contracts } = require("../../index.js")

//const { LegalSituation } = require("symboleo-js-core/core/LegalSituation.js")


//import ACPolicy from '../symboleo-js-core/core/ACPolicy'

//const { Rule } = require("/Users/sfuhaid/Symboleo2SC-demo-mainFunctionACcore/node_modules/symboleo-js-core/core/Rule.js")




class MeatSale extends SymboleoContract {
  //contractConctoller = [buyer, seller] //AC-sending default contract controller as a list, it did not work
  constructor(buyer, seller,regulator, qnt, qlt, amt, curr, payDueDate, delAdd, effDate, delDueDateDays, interestRate) {
    super("MeatSale") //Sofana-AC add buyer and seller to the constructor for controller
    this._name = "MeatSale"
    //this.buyer = buyer
    //this.seller = seller
    //////////console.log("print from test parapmetesr")
    //////////console.log(buyer)
    //////////console.log(regulator)
    ////////console.log("I am in the meatSale.js")

    //AC controller for the role is the role itself after instanestion
    this.buyer = new Buyer('buyer')
    this.buyer.warehouse = buyer.warehouse
    this.buyer.addController(this.buyer)

    //add new Role storage to test parts
    this.storage = new Storage('storage')
    this.storage.addController(this.storage)


    this.seller = new Seller('seller')
    this.seller.name = seller.name
    this.seller.returnAddress = seller.returnAddress
    this.seller.addController(this.seller)
    //AC-- we added controller for contract here her after doing an instanestion for seller and buyer
    this.addController(this.buyer)
    this.addController(this.seller)

     //access control
     this.shipper = new Shipper('shipper')
     this.shipper.addController(this.shipper)
    
    //AC--addiing regulator
    ////////console.log("I am before new regulator", regulator)
    this.regulator = new Regulator('regulator')
    this.regulator.name = regulator.name
    ////////console.log("I am after new regulator", this.regulator._name)
    ////////console.log("I am after new regulator")
    this.regulator.returnAddress = regulator.returnAddress
    ////////console.log("I am before regulator Controller")
    this.regulator.addController(this.regulator)
    ////////console.log("I am after regulator Controller")
    ////////console.log(this.regulator)

    
    //AC
    this.addRole(this.seller)
    this.addRole(this.buyer)
    this.addRole(this.regulator)
    this.addRole(this.shipper)
    this.addRole(this.storage)






    //////////console.log(seller)
    //AC - generate certificate for these two role // use name as enrollment ID
    this.userList = {buyer, seller}
    //////////console.log("userList-----------------------" + userList)
    
    this.qnt = qnt
    this.qlt = qlt
    this.amt = amt
    this.curr = curr
    this.payDueDate = payDueDate
    this.delAdd = delAdd
    this.effDate = effDate
    this.delDueDateDays = delDueDateDays
    this.interestRate = interestRate
    
    this.obligations = {};
    this.survivingObligations = {};
    this.powers = {};

        
    // assign varaibles of the contract
    this.goods = new Meat("goods", this.seller)
    /**code genration */
    //this.goods.quantity._parent = 'goods'
    this.goods.quantity._value = this.qnt
    this.goods.quantity.addController(this.seller)
    ////console.log("this.goodss")
    ////console.log(this.goods)
    this.goods.quality._value = this.qlt //new Attribute("goods.quality",this.qlt) // new from class Attribute to addRule
    //////////console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
    //////////console.log(typeof(this.goods.quality))
    //Sofana-AC
    //////////console.log("printint controller for asset from meatsale.js))))))))))))))))))))))")
    //////////console.log(this.goods._owners._value)
    //////console.log(this.goods._controller)
    //this.goods._owners = this.seller //** just for testing, it shoud be this.goods._owners = varabile sent as parapmeter or events
    //this.goods.addController(this.seller)
    
    //Sofana-AC ACPolicy
    //const ACcontroller = [this.seller,this.buyer] //add it as list
    //this.accessPolicy = new ACPolicy([this.seller,this.buyer])//old controller as a lsit
    this.accessPolicy = new ACPolicy()//regualtor(controller of ACpolicy)//[this.regulator]
    this.accessPolicy.addController(this.regulator)
    //for(let i = 0; i< ACcontroller.length;i++){
      //this.accessPolicy.addController(ACcontroller[i])
    //}
    
    //////////console.log("000000000000000000000000 acpolicy controller in meatSale.js")
    //////////console.log(this.accessPolicy._controller)
   
    
    // this.seller
    this.delivered = new Delivered("delivered") // //AC this.seller as perfomer and will be used as default for controller
    this.delivered.item._value = this.goods
    this.delivered.deliveryAddress._value = this.delAdd
    this.delivered.delDueDate._value = Utils.addTime(this.effDate, this.delDueDateDays, "days")
    //temp
    this.delivered.temperature._value = -5
    //Sofana-AC - event
    this.delivered.addPerformer(this.shipper)
    this.delivered.addController(this.shipper)

    this.shipper.job = this.delivered
    
    ////console.log("printing controller for delivered  from meatSale.jsjsjsjsjsjsjsjsjsjsjsjsjsjsjsj")
    //////console.log(this.delivered._controller)
    ////console.log(this.delivered._performer)
    ////////console.log("printing delivered")
    ////////console.log(this.delivered)
    ////////console.log("printing seller")
    ////////console.log(this.seller)

    //Sofana-AC 

    this.paidLate = new PaidLate("paidLate")
    this.paidLate.amount = (1 + this.interestRate / 100) * this.amt
    this.paidLate.currency = this.curr
    this.paidLate.from = this.buyer
    this.paidLate.to = this.seller

    this.paid = new Paid("paid")
    this.paid.amount._value = this.amt
    this.paid.currency._value = this.curr
    this.paid.from._value= this.buyer
    this.paid.to._value = this.seller
    this.paid.payDueDate._value = this.payDueDate
    //AC
    this.paid.addPerformer(this.buyer)
    this.paid.addController(this.buyer)

    this.disclosed = new Disclosed("disclosed")
    //sofana
    this.notified = new Notified("notified")
    //this.notified.message = message
    //this.notified.recipient = recipient
    //sofana

   
    //this.shipper.addController(this.shipper)
    this.shipper2 = new Seller("shipper2")
    this.assis = new Buyer("assis")
    //access control


    
    // create instance of triggered obligations (unconditional)
    // sofana-AC this.seller in the last element of parameter
    // sofana-AC this.buyer in the last element of parameter
    //this.ObDel = []
    //this.ObDel.push(this.seller)
    //////////console.log("print seller*****"+seller._name)
    //////////console.log("To print controller inside class resource", ObDel);
    //this.ObPay = []
    //this.ObPay.push(this.buyer)
   // ObDel.forEach(function(obj) {
    //  ////////console.log("To print controller inside MeateSale.js", obj._name);
    //});
    //getHappenedTime()
    //when obligation turns to inEffect state, we set start time for situation.
    //when the obligation turns to not inEffect, discharge, terminate, expire,we set end time for situation.
    //*** we add two situation (1)  when there is no anticident
    //(2) when there is anticident
    this.deliveryLegalSituation = new LegalSituation();
    //this.deliveryLegalSituation.addConsequentOf(this.delivered) // to see if it is happended or not happened and when (date/time)
    this.deliveryLegalSituation.addAntecedentOf({_type: 'eventCondition', resource:"delivered", resourceType:"Delivered"})

    //this.deliveryConsequent.addConsequentOf(this.delivered.delDueDate)
    //this.deliveryConsequent.addConsequentOf(this.obligations.payment._events.Violated)
    //name is operator, condition is the expersstion and type is condition
    this.deliveryLegalSituation.addConsequentOf({leftSide: 'delivered.temperature._value', op:'<=', rightSide:'-5', _type: 'Condition'}) // go to the parts (else)
    //this.deliveryConsequent.addConsequentOf({name: 'delivery_c2', type: 'condition', state: 'violated', type2:'obligation'}) // go to the power/obligation case
    //this.deliveryConsequent.addConsequentOf({state: "fulfillment", _type: 'stateCondition', resource:"delivery", resourceType:"obligation"})

    //eval()                                  




    //this.deliveryAntecedent.addAntecedentOf()
    //this.deliveryAntecedent.addAntecedentOf()
    
    this.obligations.delivery = new Obligation('delivery',this.storage, this.seller, this,this.deliveryLegalSituation)
    
    //when obligation is in inEffect, we set start time for situation
    //consequent
    this.paymentLegalSituation = new LegalSituation();
    this.paymentLegalSituation.addConsequentOf(this.paid)
    this.paymentLegalSituation.addConsequentOf(this.paid.payDueDate)
    this.paymentLegalSituation.addAntecedentOf({state: "fulfillment", _type: 'stateCondition', resource:"delivery", resourceType:"obligation"})


    //antecedent
    //this.paymentConsequentAntecedent.addAntecedentOf(this.delivered)
    //this.paymentConsequentAntecedent.addAntecedentOf(this.delivered.delDueDate)

    this.obligations.payment = new Obligation('payment',this.seller, this.buyer, this,this.paymentLegalSituation)
    //////console.log("this.obligations.payment.antecedent")
    //////console.log(this.obligations.payment.antecedent)




    //****Rule 
    //aPermission, aAccessedResource, aAccessedRole, aACPolicy
    //this.accessPolicy.addRulee('Read', this.goods.quality, this.buyer) //worked
    //this.accessPolicy.addRulee('Read', this.delivered, this.buyer) //worked
    //this.accessPolicy.addRulee('Read', this.obligations.payment, this.seller) //pre-authorized
    //this.accessPolicy.addRulee('Read', this.obligations.payment, this.buyer) //pre-authorized
    //this.accessPolicy.addRulee('Write', this, this.buyer)//pre-authorized // if controller of a contract, worked
    //this.accessPolicy.addRulee('Write', this, this.shipper)//give permession to access contract state, worked
   
    //power(1) next task -->events.js cuz all power are conditional 
    //power(2) next task --> events.js cuz all power are conditional 
    //Contract next task --> I added two above (this)


    //this.accessPolicy.hasPermesstion('Read',this.goods.quality,this.buyer,this.accessPolicy)

    //this.accessPolicy.hasPermesstion('Read',this.goods,this.seller) 
    //this.accessPolicy.hasPermesstion('Write',this.goods,this.seller)

    //this.accessPolicy.hasPermesstion('Read',this.delivered,this.seller)

    //this.accessPolicy.hasPermesstion('Read',this.delivered,this.buyer)
    //this.accessPolicy.hasPermesstion('Write',this.delivered,this.buyer)
    ////////console.log("print value of this");
    ////////console.log({this:this});
    if(this.accessPolicy.hasPermesstion('Write',this,this.shipper)){// first we do addRulee, then we check with has permesstion if the rule has been added or preauthrized
      ////////console.log("first has permesstion");
    }else{
      ////////console.log("first not has permesstion");
    }

    

    //this.accessPolicy.addRulee('Read', this.goods.quality, this.buyer)
    //////////console.log("rulllllllllllllllllllllllllllllllllll")
    //////////console.log(this.accessPolicy._rules)

    //test invalid(), repair()
    ////////console.log("test invlaid function")
    //this.accessPolicy.addRulee('grant','read', this.goods.quality, this.buyer, this.regulator)
    //this.accessPolicy.addRulee('revoke','read', this.goods.quality, this.buyer, this.regulator)//isValid //this.seller
    //this.accessPolicy.addRulee('grant','write', this.goods.quality, this.buyer, this.regulator)//the previos one the 'read' update to write 
    //this.accessPolicy.addRulee('revoke','all', this.goods.quality, this.buyer, this.regulator)//add and updated by removing the previos one 
    //this.accessPolicy.addRulee('grant','write', this.goods.quality, this.buyer, this.regulator)//add and update the previos one to revoke transfer 
    //more test cases 
    //this.accessPolicy.addRulee('revoke','all', this.goods.quality, this.buyer, this.regulator) //update by delet 205,206 and the add new const(rule) 
    //this.accessPolicy.addRulee('revoke','transfer', this.goods.quality, this.buyer, this.regulator)//noting 
    //this.accessPolicy.addRulee('grant','transfer', this.goods.quality, this.buyer, this.regulator)//update by revoke write, read and then add
    //this.accessPolicy.addRulee('revoke','all', this.goods.quality, this.buyer, this.regulator)//delte line 209,210 then add
    //more test cases after updateRule() ??
    //this.accessPolicy.addRulee('grant','read', this.goods.quality, this.buyer, this.seller)//isValid
    this.accessPolicy.addRulee('revoke','read', this.goods.quality, this.buyer, this.seller)//worked, added to rules
    this.accessPolicy.addRulee('grant','read', this.goods, this.buyer, this.seller)//worked but need to be checked on run time as in ppt slide 25
    //this.accessPolicy.addRulee('grant','read', this.delivered, this.buyer,this.seller) //worked
    //this.accessPolicy.addRulee('revoke','read', this.delivered, this.buyer,this.seller) //did not work(add both)
    
    //more cases 
    //this.accessPolicy.addRulee('revoke','read', this.delivered, this.seller, this.regulator)//did not added when it is the name of resource only
    //this.accessPolicy.addRulee('revoke','read', this.delivered.item, this.seller, this.regulator)//
    //this.accessPolicy.addRulee('grant','read', this.delivered, this.buyer,this.seller) //
    this.accessPolicy.addRulee('grant','read', this.obligations.payment, this.regulator,this.buyer) //pre-authorized

    //for cases line 221,222, they have been added, did not detect any conflict cuz





   ////////console.log("print rulessssssssssssssssssssssssssssssss")
   ////////console.log(this.accessPolicy._rules)
    //////////console.log("print constrainttttttttttttttttttttttttttt")
    //////////console.log(this.accessPolicy._constraints)



  }
}

module.exports.MeatSale = MeatSale
