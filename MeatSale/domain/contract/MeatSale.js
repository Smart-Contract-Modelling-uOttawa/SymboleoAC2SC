  const { PerishableGood } = require("../assets/PerishableGood.js")
  const { Meat } = require("../assets/Meat.js")
  const { Delivered } = require("../events/Delivered.js")
  const { Paid } = require("../events/Paid.js")
  const { PaidLate } = require("../events/PaidLate.js")
  const { InspectedQuality } = require("../events/InspectedQuality.js")
  const { PasswordNotification } = require("../events/PasswordNotification.js")
  const { UnLoaded } = require("../events/UnLoaded.js")
  const { Seller } = require("../roles/Seller.js")
  const { Buyer } = require("../roles/Buyer.js")
  const { TransportCo } = require("../roles/TransportCo.js")
  const { Assessor } = require("../roles/Assessor.js")
  const { Regulator } = require("../roles/Regulator.js")
  const { Storage } = require("../roles/Storage.js")
  const { Shipper } = require("../roles/Shipper.js")
  //** */
  const { Admin } = require("../roles/Admin.js")
  const { Currency } = require("../types/Currency.js")
  const { MeatQuality } = require("../types/MeatQuality.js")
  const { SymboleoContract } = require("symboleoac-js-core")
  const { Obligation } = require("symboleoac-js-core")
  const { Power } = require("symboleoac-js-core")
  const { Utils } = require("symboleoac-js-core")
  const { Str } = require("symboleoac-js-core")
  const { ACPolicy } = require("symboleoac-js-core")
  //const { Notified } = require("../events/Notified.js")
  const { Attribute } = require("symboleoac-js-core")
  const { Rule } = require("symboleoac-js-core")
  const { LegalSituation } = require("symboleoac-js-core")
  const { contracts } = require("../../index.js")
  
  class MeatSale extends SymboleoContract {
    constructor(buyerP, sellerP, transportCoP, assessorP, regulatorP, storageP, shipperP, adminP, barcodeP, qnt, qlt, amt, curr, payDueDate, delAdd, effDate, delDueDateDays, interestRate) {
      super("MeatSale")
      this._name = "MeatSale"
      this.buyerP = buyerP
      this.sellerP = sellerP
      this.transportCoP = transportCoP
      this.assessorP = assessorP
      this.regulatorP = regulatorP
      this.storageP = storageP
      this.shipperP = shipperP
      //** */
      this.adminP = adminP

      this.barcodeP = barcodeP
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
      console.log("before seller")
      		this.seller = new Seller("seller")
       console.log("after seller")


      
this.seller.name._value = this.sellerP.name
this.seller.returnAddress._value = this.sellerP.returnAddress
//** */
this.seller.org._value = this.sellerP.org
this.seller.dept._value = this.sellerP.dept
       this.seller.addController(this.seller)  
       	 this.addRole(this.seller)


//** */
this.admin = new Admin("admin")
this.admin.name._value = this.adminP.name
this.admin.org._value = this.adminP.org
this.admin.dept._value = this.adminP.dept
       this.seller.addController(this.admin)  
       	 this.addRole(this.admin)

      		this.buyer = new Buyer("buyer")

this.buyer.name._value = this.buyerP.name
this.buyer.warehouse._value = this.buyerP.warehouse
//** */
this.buyer.org._value = this.buyerP.org
this.buyer.dept._value = this.buyerP.dept
       this.buyer.addController(this.buyer)  
       	 this.addRole(this.buyer)
      		this.transportCo = new TransportCo("transportCo")
      
this.transportCo.name._value = this.transportCoP.name
       this.transportCo.addController(this.transportCo)  
       	 this.addRole(this.transportCo)
      		this.assessor = new Assessor("assessor")
      
this.assessor.name._value = this.assessorP.name
       this.assessor.addController(this.assessor)  
       	 this.addRole(this.assessor)
      		this.regulator = new Regulator("regulator")
      
this.regulator.name._value = this.regulatorP.name
       this.regulator.addController(this.regulator)  
       	 this.addRole(this.regulator)
//** */
this.regulator.org._value = this.regulatorP.org
this.regulator.dept._value = this.regulatorP.dept

      		this.storage = new Storage("storage")
      
this.storage.address._value = this.storageP.address
       this.storage.addController(this.storage)  
       	 this.addRole(this.storage)
      		this.shipper = new Shipper("shipper")
      
this.shipper.name._value = this.shipperP.name
       this.shipper.addController(this.shipper)  
       	 this.addRole(this.shipper)
      		this.goods = new Meat("goods")
      
this.goods.quantity._value = this.qnt
this.goods.quality._value = this.qlt
this.goods.barcode._value = this.barcodeP
this.goods.owner = this.seller
       this.goods.addController(this.seller)  
      		this.delivered = new Delivered("delivered")
      
this.delivered.deliveryAddress._value = this.delAdd
this.delivered.delDueDate._value = Utils.addTime(this.effDate, this.delDueDateDays, "days")
      this.delivered.addPerformer(this.transportCo)
this.delivered.addController(this.seller)
      		this.paidLate = new PaidLate("paidLate")
      
this.paidLate.amount._value = (1 + this.interestRate / 100) * this.amt
this.paidLate.currency._value = this.curr
this.paidLate.from._value = this.buyer
this.paidLate.to._value = this.seller
      this.paidLate.addPerformer(this.buyer)
       this.paidLate.addController(this.buyer)  
      		this.paid = new Paid("paid")
      
this.paid.amount._value = this.amt
this.paid.currency._value = this.curr
this.paid.from._value = this.buyer
this.paid.to._value = this.seller
this.paid.payDueDate._value = this.payDueDate
      this.paid.addPerformer(this.buyer)
       this.paid.addController(this.buyer)  
      		this.passwordNotification = new PasswordNotification("passwordNotification")
      
      this.passwordNotification.addPerformer(this.transportCo)
       this.passwordNotification.addController(this.transportCo)  
      		this.inspectedQuality = new InspectedQuality("inspectedQuality")
      
      this.inspectedQuality.addPerformer(this.assessor)
       this.inspectedQuality.addController(this.assessor)  
      		this.unLoaded = new UnLoaded("unLoaded")
      
      this.unLoaded.addPerformer(this.assessor)
       this.unLoaded.addController(this.assessor)  
this.accessPolicy = new ACPolicy([this.seller])
this.addController(this.seller); 
this.addController(this.buyer); 
      // create instance of triggered obligations
          	    this.deliverySituation = new LegalSituation();
          	  
          	  this.deliverySituation.addConsequentOf({_type: 'eventCondition', resource:"delivered", resourceType:"Delivered"} )
          	   this.deliverySituation.addConsequentOf({ leftSide:'this.delivered.deliveryAddress._value', op:'===', rightSide: 'this.buyer.warehouse._value', _type: 'Condition'})
        this.obligations.delivery = new Obligation('delivery', this.buyer, this.seller, this, this.deliverySituation)
          	    this.paymentSituation = new LegalSituation();
          	  
          	  this.paymentSituation.addConsequentOf({_type: 'eventCondition', resource:"paid", resourceType:"Paid"} )
      
      this.paymentSituation.addAntecedentOf({_type: 'eventCondition', resource:"unLoaded", resourceType:"UnLoaded"} )
        this.obligations.payment = new Obligation('payment', this.seller, this.buyer, this, this.paymentSituation)
      
      
    
this.accessPolicy.addRulee("grant", "read", this.goods.quantity, this.buyer, this.seller)
this.accessPolicy.addRulee("grant", "read", this.obligations.delivery, this.assessor, this.seller)
this.accessPolicy.addRulee("grant", "read", this.inspectedQuality, this.transportCo, this.assessor)
this.accessPolicy.addRulee("grant", "read", this.inspectedQuality, this.seller, this.assessor)
this.accessPolicy.addRulee("grant", "write", this.inspectedQuality, this.assessor, this.seller)
this.accessPolicy.addRulee("revoke", "read", this.goods.quality, this.buyer, this.seller)

 	}
}
  
  module.exports.MeatSale = MeatSale
