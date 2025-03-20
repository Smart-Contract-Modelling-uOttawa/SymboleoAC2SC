//flat
const {stringify, parse } = require('flatted');

const { MeatSale } = require("./domain/contract/MeatSale.js")
const { Obligation, LegalPosition, ObligationActiveState, ObligationState } = require("symboleo-js-core")
const { InternalEventType, InternalEvent, InternalEventSource} = require("symboleo-js-core")
const { Event } = require("symboleo-js-core")
const { Power } = require("symboleo-js-core")
const { Meat } = require("./domain/assets/Meat.js")
const { Delivered } = require("./domain/events/Delivered.js")
//sofana
const { Notified } = require("./domain/events/Notified.js")
//sofana
const { Paid } = require("./domain/events/Paid.js")
const { PaidLate } = require("./domain/events/PaidLate.js")
const { Disclosed } = require("./domain/events/Disclosed.js")
const { Seller } = require("./domain/roles/Seller.js")
const { Buyer } = require("./domain/roles/Buyer.js")
//CA
const { Regulator } = require("./domain/roles/Regulator.js")
const { Storage } = require("./domain/roles/Storage.js")
const { Shipper } = require("./domain/roles/Shipper.js")

const { Resource } = require("/Users/sfuhaid/Symboleo2SC-demo-mainFunctionACcore/node_modules/symboleo-js-core/core/Resource.js")
const { LegalSituation } = require("/Users/sfuhaid/Symboleo2SC-demo-mainFunctionACcore/node_modules/symboleo-js-core/core/LegalSituation.js")

//
const { ContractState, ContractActiveState } = require("symboleo-js-core")
const { Events } = require("symboleo-js-core")
//const { LegalSituation } = require("symboleo-js-core")
const { EventListeners, getEventMap } = require("./events.js")
//const { ACPolicy } = require("symboleo-js-core")
const { ACPolicy } = require("/Users/sfuhaid/Symboleo2SC-demo-mainFunctionACcore/node_modules/symboleo-js-core/core/ACPolicy.js")
const { Attribute } = require("/Users/sfuhaid/Symboleo2SC-demo-mainFunctionACcore/node_modules/symboleo-js-core/core/Attribute.js")
const { Rule } = require("/Users/sfuhaid/Symboleo2SC-demo-mainFunctionACcore/node_modules/symboleo-js-core/core/Rule.js")


//AC
/*const classMap = {   
  'Seller': Seller,   
  'Buyer': Buyer, 
  'Regulator': Regulator,
  'Delivered': Delivered,
  'Disclosed': Disclosed,
  'Paid': Paid,
  'PaidLate':PaidLate,
  'Meat':Meat,
  'Obligation':Obligation,
  'Power':Power,
  'Rule':Rule,
  'Resource':Resource,
  'LegalSituation': LegalSituation
};*/

let contract = null

function deserialize(data) {
  // here we change the the way to parese the data to solve the problem of circuling: we use ...
  // customize function of circuling that add ref to the object that has circiling insdie it
  
  ////////////////console.log("before parse");
  let object = parse(data,reviver);//JSON.parse(data)
  ////////////////console.log("object")
  //////////////////console.log(object.delivered)
  //object = resolveReferences(object);
  //////////////////console.log(object._controller);
  
  //const object = JSON.parse(data)
  //////////////////console.log("printing object data");
  //////////////////console.log(object._controller)
  //////////////console.log("I am in the serlizer before meatsale")
  contract = new MeatSale(object.buyer, object.seller, object.regulator, object.qnt, object.qlt, object.amt, object.curr, object.payDueDate, object.delAdd, object.effDate, object.delDueDateDays, object.interestRate)
  //////////////console.log("contract._rules")
  //////////////console.log(contract.accessPolicy._rules)
  //////////////console.log("object._rules")
  //////////////console.log(object.accessPolicy._rules)
  //////////////console.log("contract.seller after meatsale instsition")
  //////////////console.log(contract.seller)
  
  //add all rules to this._roles
  ////console.log("object._roles")
  ////console.log(object._roles)
  for(obj of object._roles){
    contract.addRole(obj)
  }
  ////console.log("contract._roles")
  ////console.log(contract._roles)

 


  contract.state = object.state
  contract.activeState = object.activeState
  //////////////console.log("I am in the serlizer under meatsale")

  //AC- print controller for contract
  //////////////////console.log("Contract controller value  in serlizer..............................")
  //////////////////console.log(contract._controller)
  // assginemnt from object, so whenever the value of controller chnage at run time, it will be resturned
  //contract._controller = object._controller
  //////////////////console.log("printing the value of contract controller after asssignment")
  //////////////////console.log(contract._controller)
  //contract._roles = object._roles

  
  //AC for genrtaing certificate for each user, use name as an enrollment ID
  contract.userList = object.userList
  //////////////////console.log(contract.userList)

  //AC- acpolicy
  const ac = new ACPolicy()
  ////////////////console.log( "before1111111111111111111111111111111 ACpolicy")
  ////////////////console.log( object.accessPolicy._controller)

  //ac._controller = object.accessPolicy._controller

  




  //////////////////console.log( "1111111111111111111111111111111")
  //////////////////console.log( object.accessPolicy._controller)
  //ac = object.accessPolicy
  contract.accessPolicy = ac

 
  //contract.accessPolicy._controller = object.accessPolicy._controller
  //////////////////console.log("ACACACACACACACACACACACACACACACACACACAC policy controller")
  //////////////////console.log(contract.accessPolicy._controller)
  
  //*** important note for generating code in Xtend: to retrive list of all the assets, and roles
  //AC- printing controller for asset and retering the value of owner and controller from the object
  ////////////////console.log("Asset infoooooooooooooooooo") //AC
  //let x = 0
/*
  if(typeof attr === 'object' && attr !== null){
             
    ////////console.log(contract[key]?.[eKey]); 
  if(attr._type === 'Attribute'){
    
    ////////console.log("AAAAattr"); 
    ////////console.log(attr._controller); 
    ////////console.log("contract[key][eKey]")
    contract[key][eKey]._controller = []
  */

    //
    for (const key of Object.keys(object)) {
      ////console.log("object name")
      ////console.log(key)
      //let obj = object[key]
      if(key !== 'obligations' && key !== 'powers'){
     
      if (typeof object[key] === 'object' && object[key] !== null && !Array.isArray(object[key])) {
        
        for(const eKey of Object.keys(object[key])) {
          //if(!Array.isArray(eKey) && (!(typeof Object.keys(object[key])  === 'undefined') && !(Object.keys(object[key])  === null)))
          //{
           //const eKey = Object.keys(object[key])
           ////////console.log("&&&")
           ////////console.log(key, "eKey" , eKey)
        
           ////////console.log("*****")
           ////////console.log(contract[object[key][eKey]._name])
           ////////console.log("typeof object[key][eKey]")
           ////////console.log(typeof object[key][eKey])
           ////////console.log("Test the value of eKey ")
           ////////console.log(eKey, eKey === '_controller')
           if(typeof  object[key][eKey] === 'object' &&  object[key][eKey] !== null){
                ////////console.log(contract[key]?.[eKey])
                //////console.log("I am inside the object")
           if(object[key][eKey]._type === 'Attribute'){
             contract[key][eKey]._value = object[key][eKey]._value
     
     
           }else{
             //if it is a list but it is not controller, bring it back
             const x = object[key][eKey]
             ////////console.log("xxxxxxxxxxx")
             ////////console.log(x._name)
             if(eKey !== '_controller'){
               ////////console.log("object[key][eKey]")
               ////////console.log(object[key][eKey])
               ////////console.log("contract[object[key][eKey]._name]")
               ////////console.log(contract[object[key][eKey]._name])
         
               if(contract[object[key][eKey]._name] !=  undefined){ 
                 if(contract[x._name]._type === x._type){
                   ////////console.log("I am in contract object")
                   ////////console.log(contract[x._name])
     
                   contract[key][eKey] =  contract[x._name]
     
                 }else{//return objects that does not have type
                   contract[key][eKey] = object[key][eKey]
                 }
                 
                 
             }else{//return objects that does not have name
               contract[key][eKey] = object[key][eKey]
     
             }
               
             }
           }
     
     
           }else{//string/numerical and so on 
             contract[key][eKey] = object[key][eKey]
     
     
           }
                  
       }//nested for

        }
      }
    }
    

  
    
  




  //return asset, role, policy, events
  //This loop to retrive all the attributes (except controller, performer) of all the objects except legal positions (obligation/power)
  /*
  for (const key of ['goods','seller','buyer', 'regulator','accessPolicy', 'storage','delivered', 'paidLate', 'paid', 'disclosed','shipper']) {

    for(const eKey of Object.keys(object[key])) {

      if(typeof  object[key][eKey] === 'object' &&  object[key][eKey] !== null){
     
      if(object[key][eKey]._type === 'Attribute'){
        contract[key][eKey]._value = object[key][eKey]._value


      }else{
        const x = object[key][eKey]

        if(eKey !== '_controller'){
   
    
          if(contract[object[key][eKey]._name] !=  undefined){ 
            if(contract[x._name]._type === x._type){
           

              contract[key][eKey] =  contract[x._name]

            }else{//return objects that does not have type
              contract[key][eKey] = object[key][eKey]
            }
            
            
        }else{//return objects that does not have name
          contract[key][eKey] = object[key][eKey]

        }
          
        }
      }


      }else{//string/numerical and so on 
        contract[key][eKey] = object[key][eKey]


      }
             
  }//nested for
  }*/
  //////////////console.log("contract.buyer")
  //////////////console.log(contract.buyer)
  //////////////console.log("contract.buyer._controller")
  //////////////console.log(contract.buyer._controller)

  //contract.seller._controller = object.seller._controller
  //contract.buyer._controller = object.buyer._controller
  //contract.regulator._controller = object.regulator._controller
  //contract.shipper._controller = object.shipper._controller


  //////////////console.log("contract.seller")
  //////////////console.log(contract.seller)
  //////////////console.log("contract.seller._controller")
  //////////////console.log(contract.seller._controller)
  //////////////console.log("object.seller._controller")
  //////////////console.log(object.seller._controller)
  //////////////console.log("object.seller")
  //////////////console.log(object.seller)

  contract.accessPolicy._rules = object.accessPolicy._rules

  ////////////////console.log("done with Asset infoooooooooooooooooo") //AC
  //////////////////console.log(contract.goods)
  //////////////////console.log(contract.seller._controller)
  //////////////////console.log(contract.buyer._controller)
  //////////////////console.log(contract.accessPolicy._controller)
  //////////////////console.log(contract.accessPolicy._rules)
  //////////////////console.log("print shipper") //AC
  //const shiperController = ${'0': contract.shipper._controller }
  //////////////////console.log(contract.shipper._controller[0])


  // internal events
  for (const eventType of Object.keys(InternalEventType.contract)) {
    if (object._events[eventType] != null) {
      const eventObject = new Event()
      eventObject._triggered = object._events[eventType]._triggered
      eventObject._timestamp = object._events[eventType]._timestamp
      contract._events[eventType] = eventObject
    }
  }
  // external event
  ////////////////console.log("Events infoooooooooooooooooo") //AC
/* 
  for (const key of ['delivered', 'paidLate', 'paid', 'disclosed']) {
    for(const eKey of Object.keys(object[key])) {
      contract[key][eKey] = object[key][eKey]
      //Sofana-AC
      //////////////console.log(contract['delivered'][eKey])
      //Sofana-AC
    }
  }*/
  //////////console.log("contract.delivered***")
  //////////////console.log(contract.delivered)
  //////////////console.log("contract.delivered._controller***")
  //////////console.log(contract.delivered._performer)



  //AC- event- contract
  //contract.delivered._controller = object.delivered._controller
  //contract.paidLate._controller = object.paidLate._controller
  //contract.paid._controller = object.paid._controller
  //contract.disclosed._controller = object.disclosed._controller


  //stop contract.delivered._performer = object.delivered._performer
  ////////////////console.log("Event info from the object")
  ////////////////console.log(contract.delivered._controller)
  ////////////////console.log(contract.delivered._performer)
  //AC- event- with object
  //////////////////console.log(object.delivered._controller)
  //////////////////console.log(object.delivered._performer)

  if (object.obligations.latePayment != null) {
    const obligation = new Obligation('latePayment', contract.seller, contract.buyer, contract)
    obligation.state = object.obligations.latePayment.state
    //Sofana--> Add performer
    //obligation.performer = JSON.parse(JSON.stringify(object.obligations.latePayment.performer));
    //obligation.performer = object.obligations.latePayment.performer.slice();
    //sofana
    //sofana-CA
    /*
     obligation._controller = object.obligations.latePayment._controller;
     obligation._performer = object.obligations.latePayment._performer
     obligation._rightHolder = object.obligations.latePayment._rightHolder
     obligation._liable = object.obligations.latePayment._liable
     */
    //////////////////console.log("I am in serializer.js obligation late Payment state (1): " + obligation.state)
    //sofana
    obligation.activeState = object.obligations.latePayment.activeState
     //sofana
     //////////////////console.log("I am in serializer.js obligation late Payment state (2): " + obligation.activeState)
     //sofana
    obligation.consequent = object.obligations.latePayment.consequent
    obligation.antecedent = object.obligations.latePayment.antecedent
    obligation._createdPowerNames = object.obligations.latePayment._createdPowerNames
    obligation._suspendedByContractSuspension = object.obligations.latePayment._suspendedByContractSuspension
    for (const eventType of Object.keys(InternalEventType.obligation)) {
      if (object.obligations.latePayment._events[eventType] != null) {
        const eventObject = new Event()
        eventObject._triggered = object.obligations.latePayment._events[eventType]._triggered
        eventObject._timestamp = object.obligations.latePayment._events[eventType]._timestamp
        obligation._events[eventType] = eventObject
      }
    }
    contract.obligations.latePayment = obligation
  }//Sofana-AC here I added contract.performer.slice(-1).pop()/ 
  //Sofana-Ac for controller the default we add it to the constrctor in the legal position class, and here (serlizer) we retrive the last value of controller in obligation.controller
  if (object.obligations.delivery != null) {
    //////////////////console.log("I am in the selizer before");
    const obligation = new Obligation('delivery', contract.storage, contract.seller, contract)//contract.obligations.delivery.performer.pop() //object.obligations.delivery.Controller
    //////////////////console.log("************************************");
    //////////////////console.log(object.obligations.delivery.Controller);
    obligation.state = object.obligations.delivery.state
    //sofana-CA
    /*
    obligation._controller = object.obligations.delivery._controller;
    obligation._performer = object.obligations.delivery._performer
    obligation._rightHolder = object.obligations.delivery._rightHolder
    obligation._liable = object.obligations.delivery._liable
    */
    //////////////////console.log("printing controllr and others for delivery ***********************")
    //////////////////console.log(obligation)
    //////////////////console.log("begin of controller")
    //////////////////console.log(obligation._controller)
    //////////////////console.log("end of controller")
    //////////////////console.log(obligation._performer)
    //////////////////console.log(obligation._rightHolder)
    //////////////////console.log(obligation._liable)
    //sofana-CA
    //////////////////console.log("I am in serializer.js obligation delivery performer/controller $$$$$$$$$$$$$$$$$$$$$$$$(1): " + obligation.performer)
    //sofana
    //////////////////console.log("I am in serializer.js obligation delivery state (1): " + obligation.state)
    //sofana
    obligation.consequent = object.obligations.delivery.consequent
    obligation.antecedent = object.obligations.delivery.antecedent
    obligation.activeState = object.obligations.delivery.activeState
    //
    //sofana
    //////////////////console.log("I am in serializer.js to print obligation delivery activeState (2): " + obligation.state)
    //sofana
    obligation._createdPowerNames = object.obligations.delivery._createdPowerNames
    obligation._suspendedByContractSuspension = object.obligations.delivery._suspendedByContractSuspension
    for (const eventType of Object.keys(InternalEventType.obligation)) {
      if (object.obligations.delivery._events[eventType] != null) {
        const eventObject = new Event()
        eventObject._triggered = object.obligations.delivery._events[eventType]._triggered
        eventObject._timestamp = object.obligations.delivery._events[eventType]._timestamp
        obligation._events[eventType] = eventObject
      }
    }
    contract.obligations.delivery = obligation
  }//Sofana-AC here I added contract.performer.slice(-1).pop()/ 
  /** 
   * Sofana-AC
   * Also, we add line 102 to retrive all information of obigation after each initiization -- obligation.Controller = object.obligations.payment.Controller
   * Also, we add performer
  */ 
  if (object.obligations.payment != null) {
    const obligation = new Obligation('payment', contract.seller, contract.buyer, contract)//contract.obligations.delivery.performer.pop()
    //////////////////console.log("************************************&&&&&&&&&&********&&&&&&&&&&&&");
    //obligation.Controller.push(contract.seller);
    //sofana-CA
    //obligation._controller = object.obligations.payment._controller
    //obligation.addController(contract.seller);
    //////////////////console.log(obligation._controller);
    //for (let i = 0; i < object.obligations.payment.Controller; i++) {
      //////////////////console.log(""+object.obligations.payment.Controller[i]);	
    //}
    obligation.state = object.obligations.payment.state
    //Sofana-AC 
    /*
    obligation._performer = object.obligations.payment._performer
    obligation._rightHolder = object.obligations.payment._rightHolder
    obligation._liable = object.obligations.payment._liable
    */
    //sofaan
    //////////////////console.log("I am in serializer.js obligation payment state (1): " + obligation.state)
    //sofana
    obligation.consequent = object.obligations.payment.consequent
    obligation.antecedent = object.obligations.payment.antecedent
    obligation.activeState = object.obligations.payment.activeState
    //sofana
    ////////////////console.log("I am in serializer.js obligation payment state (2): " + obligation.state)
    //sofana
    obligation._createdPowerNames = object.obligations.payment._createdPowerNames
    obligation._suspendedByContractSuspension = object.obligations.payment._suspendedByContractSuspension
    for (const eventType of Object.keys(InternalEventType.obligation)) {
      if (object.obligations.payment._events[eventType] != null) {
        const eventObject = new Event()
        eventObject._triggered = object.obligations.payment._events[eventType]._triggered
        eventObject._timestamp = object.obligations.payment._events[eventType]._timestamp
        obligation._events[eventType] = eventObject
      }
    }
    contract.obligations.payment = obligation
  }
  //////////////////console.log("object.powers.suspendDelivery frol serlizer before the if")
  //////////////////console.log(object.powers.suspendDelivery)
  if (object.powers.suspendDelivery != null) {
    const power = new Power('suspendDelivery', contract.seller, contract.seller, contract)
    power.state = object.powers.suspendDelivery.state
    power.activeState = object.powers.suspendDelivery.activeState
    //Sofana-AC
    //power._controller = object.powers.suspendDelivery._controller
    //////////////////console.log("printing controller for suspendDelivery power from serlizer")
    //////////////////console.log("begin of controller")
    //////////////////console.log(power._controller )
    //////////////////console.log("end of controller")
    /*
    power._performer = object.powers.suspendDelivery._performer
    power._rightHolder = object.powers.suspendDelivery._rightHolder
    power._liable = object.powers.suspendDelivery._liable
    */
    power.consequent = object.powers.suspendDelivery.consequent
    power.antecedent = object.powers.suspendDelivery.antecedent
    //Sofana-AC
    for (const eventType of Object.keys(InternalEventType.power)) {
      if (object.powers.suspendDelivery._events[eventType] != null) {
        const eventObject = new Event()
        eventObject._triggered = object.powers.suspendDelivery._events[eventType]._triggered
        eventObject._timestamp = object.powers.suspendDelivery._events[eventType]._timestamp
        power._events[eventType] = eventObject
      }
    }
    contract.powers.suspendDelivery = power
    //CA
    //////////////////console.log("power controller from serlizer")
    //////////////////console.log(contract.powers.suspendDelivery._controller) 
  }
  if (object.powers.resumeDelivery != null) {
    const power = new Power('resumeDelivery', contract.buyer, contract.buyer, contract)
    power.state = object.powers.resumeDelivery.state
    power.activeState = object.powers.resumeDelivery.activeState
    //Sofana-AC
    /*
    power._controller = object.powers.resumeDelivery._controller;
    power._performer = object.powers.resumeDelivery._performer
    power._rightHolder = object.powers.resumeDelivery._rightHolder
    power._liable = object.powers.resumeDelivery._liable
    */
    power.consequent = object.powers.resumeDelivery.consequent
    power.antecedent = object.powers.resumeDelivery.antecedent
    //Sofana-AC
    for (const eventType of Object.keys(InternalEventType.power)) {
      if (object.powers.resumeDelivery._events[eventType] != null) {
        const eventObject = new Event()
        eventObject._triggered = object.powers.resumeDelivery._events[eventType]._triggered
        eventObject._timestamp = object.powers.resumeDelivery._events[eventType]._timestamp
        power._events[eventType] = eventObject
      }
    }
    contract.powers.resumeDelivery = power
  }
  if (object.powers.terminateContract != null) {
    const power = new Power('terminateContract', contract.buyer, contract.buyer, contract)
    power.state = object.powers.terminateContract.state
     //sofana
    // ////////////////console.log("I am in serializer.js contract termenation state (1)" + power.state)
     //sofana
    power.activeState = object.powers.terminateContract.activeState
    //Sofana-AC
    /*
    power._controller = object.powers.terminateContract._controller;
    power._performer = object.powers.terminateContract._performer
    power._rightHolder = object.powers.terminateContract._rightHolder
    power._liable = object.powers.terminateContract._liable
    */
    power.consequent = object.powers.terminateContract.consequent
    power.antecedent = object.powers.terminateContract.antecedent

    //Sofana-AC
     //sofana
    // ////////////////console.log("I am in serializer.js contract termenation state (2)" + power.activeState)
     //sofana
    for (const eventType of Object.keys(InternalEventType.power)) {
      if (object.powers.terminateContract._events[eventType] != null) {
        const eventObject = new Event()
        eventObject._triggered = object.powers.terminateContract._events[eventType]._triggered
        eventObject._timestamp = object.powers.terminateContract._events[eventType]._timestamp
        power._events[eventType] = eventObject
      }
    }
    contract.powers.terminateContract = power
  }
  
  //***Code generator, for the add controller for policy and contract, we will add it here after powers and obligations */
  
  
  contract.seller._controller = []
  contract.delivered._controller = []
  contract.shipper._controller = []

  //contract.delivered._performer = []
  //////////////console.log("object.delivered._controller")
  //////////////console.log(object.delivered._controller)
  //contract.delivered._controller = object.delivered._controller
  //////////////console.log("contract.delivered._controller")
  //////////////console.log(contract.delivered._controller)

  //////////////console.log("contract.delivered before second for")
  //////////////console.log(contract.delivered)
  //////////////console.log("contract.delivered._controller before second for")
  //////////////console.log(contract.delivered._controller)

 
 
//add all powers and obligations and same things for performer
// 'terminateContract','resumeDelivery','suspendDelivery', 'payment', 'delivery', 'latePayment'
 const contractList = ['seller','buyer', 'storage', 'regulator', 'shipper','delivered', 'paidLate', 'paid', 'disclosed','goods','accessPolicy']
 

 //////console.log("object.goods")
 //////console.log(object.goods)
 for (const key of contractList) {
    if(object[key] === 'undefined'){
       continue
      }else{

        contract[key]._controller = []
        for(const valuet of object[key]._controller) {
          contract[key].addController(reviverList(valuet)) 
     
        }//for Event
        if(contract[key] instanceof Event){
          contract[key]._performer = []
          for(const valuet of object[key]._performer) {
            contract[key].addPerformer(reviverList(valuet)) 
          }

        }
        /////////////////////////////////////////////////////////
        /*
        for(const eKey of Object.keys(key)) {
          //if(!Array.isArray(eKey) && (!(typeof Object.keys(object[key])  === 'undefined') && !(Object.keys(object[key])  === null)))
          //{
           //const eKey = Object.keys(object[key])
           //contract[key][eKey] = object[key][eKey]
           ////////console.log("attr")
           ////////console.log(contract[key][eKey])//
           //contract[key][eKey] = object[key][eKey]
           //Sofana-AC
           //Sofana-AC
         // }  
         //}
       }*/
         //retrive and add controller to attributes 
         
         for (const eKey of Object.keys(object[key])) { 
          //if (eKey !== undefined && eKey !== null) { 
              ////////console.log("Aattr", eKey);
              let attr = object[key][eKey]
              ////////console.log("attr type:", typeof attr, attr); 
             
              if(typeof attr === 'object' && attr !== null){
             
                ////////console.log(contract[key]?.[eKey]); 
              if(attr._type === 'Attribute'){
                
                ////////console.log("AAAAattr"); 
                ////////console.log(attr._controller); 
                ////////console.log("contract[key][eKey]")
                contract[key][eKey]._controller = []
                //////console.log("attr type:", object[key][eKey])
                //////console.log("attr _controller:", object[key][eKey]._controller)
                for(const valuet of object[key][eKey]._controller) {
                  ////////console.log("I am inside the loop")
                  contract[key][eKey].addController(reviverList(valuet)) 

             
                }
                
                ////////console.log("contract[key][eKey]._controller")
                ////////console.log(contract[key][eKey]._controller)
              }

              }
              
            

          //}
      }

/*
      for (const key of Object.keys(contract)) { // Loop through top-level keys (e.g., someKey)
        for (const eKey of Object.keys(contract[key])) { // Loop through attributes inside each key
            const attr = contract[key][eKey];
    
            if (typeof attr === "object" && attr !== null && attr._type === 'Attribute') {
                ////////console.log(`Attribute: ${eKey}`);
                ////////console.log("Controller:", attr._controller);
            }
        }
    }*/
      

        ////////////////////////////////////////////////////////
      }
}


//retrive all obligation and add controllers, performers and so on
for (const key of Object.keys(contract.obligations)){
        //////////console.log("controller")
        //////////console.log(contract.obligations[key]._controller)
        contract.obligations[key]._controller = []
        for(const valuet of object.obligations[key]._controller) {
          contract.obligations[key].addController(reviverList(valuet)) 
          ////////////console.log("valuet")
          ////////////console.log(valuet._type)
          ////////////console.log(valuet._name)
        }
        
        //if(object[key]._performer !== 'undefined' && object[key]._performer !== null && typeof object[key]._performer === 'object' && !Array.isArray(object[key]._performer)){
          contract.obligations[key]._performer = []
          for(const valuet of object.obligations[key]._performer) {
            contract.obligations[key].addPerformer(reviverList(valuet)) 
          }
          
          contract.obligations[key]._rightHolder = []
          for(const valuet of object.obligations[key]._rightHolder) {
            contract.obligations[key].addRightHolder(reviverList(valuet)) 
          }

          contract.obligations[key]._liable = []
          for(const valuet of object.obligations[key]._liable) {
            contract.obligations[key].addLiable(reviverList(valuet)) 
          }

    
}
//power
//retrive all power and add controllers, performers and so on
for (const key of Object.keys(contract.powers)){
  contract.powers[key]._controller = []
  for(const valuet of object.powers[key]._controller) {
    contract.powers[key].addController(reviverList(valuet)) 
    ////////////console.log("valuet")
    ////////////console.log(valuet._type)
    ////////////console.log(valuet._name)
  }
  
  //if(object[key]._performer !== 'undefined' && object[key]._performer !== null && typeof object[key]._performer === 'object' && !Array.isArray(object[key]._performer)){
    contract.powers[key]._performer = []
    for(const valuet of object.powers[key]._performer) {
      contract.powers[key].addPerformer(reviverList(valuet)) 
    }
    
    contract.powers[key]._rightHolder = []
    for(const valuet of object.powers[key]._rightHolder) {
      contract.powers[key].addRightHolder(reviverList(valuet)) 
    }

    contract.powers[key]._liable = []
    for(const valuet of object.powers[key]._liable) {
      contract.powers[key].addLiable(reviverList(valuet)) 
    }

}




  //for (const key of contractList) {

    //if (!object[key]) {
      ////////////console.warn(`Skipping ${key}: Not found in object`);
      //continue;
  //}
    //for(const eKey of Object.keys(object[key]))
    //for(const eKey of Object.keys) {
      ////////////console.log("eKey")
      ////////////console.log("eKey = " + eKey)
     //if(eKey === '_controller'){
      //for(const valuet of object[key][eKey]) {
        ////////////console.log("valuet")
        ////////////console.log(valuet)

        //if(eKey === '_controller'){
         //contract[key].addController(reviverList(valuet)) 
        //}

     //}
     //}

    //}
  //}

   //add controller to contract 
   contract._controller = []
   for(obj of object._controller){
    contract.addController(reviverList(obj)) 
  }

  //retrive all rules of all resourcers 
  contract.accessPolicy._rules = object.accessPolicy._rules
  //console.log("contract.accessPolicy._rules")
  //console.log(contract.accessPolicy._rules)
  //console.log("contract.accessPolicy._rules.length")
  //console.log(contract.accessPolicy._rules.length)
  for (let i = 0; i < object.accessPolicy._rules.length; i++) {
    let obj = object.accessPolicy._rules[i].accessedResource 
    ////////console.log("obj")
    ////////console.log(obj)
    //retrive rules of obligation and power
    if(object.accessPolicy._rules[i].accessedResource._type.toLowerCase() === 'obligation' || object.accessPolicy._rules[i].accessedResource._type.toLowerCase() === 'power'){
      contract.accessPolicy._rules[i].accessedResource = contract.findLegalPosition(obj.name, obj._type, contract)
    }else{//worked and retrive rules for all resources acccept resources.attribute is in the else
      ////////console.log("contract[obj._name]")
      ////////console.log(contract[obj._name])
      if(contract[obj._name] != undefined){
        contract.accessPolicy._rules[i].accessedResource = contract[obj._name]  //findObject(obj._name, obj._type, contract)
      }else{
        ////////console.log("inside else")
        contract.accessPolicy._rules[i].accessedResource = contract[obj._parent][obj._name]
       
        //for(let n of contract[obj._name])
          //////////console.log("n=")
          //////////console.log(contract[obj._parent])
          //////////console.log("nn=")
          //////////console.log(contract[obj._parent][obj._name])
          //////////console.log(g2)
      }
    }//retrive accessedRole
    obj = object.accessPolicy._rules[i].accessedRole
    ////console.log("objjjjjjjjjjjjjjjjjjjjjjjjjjjj")
    ////console.log(obj)
    if(obj != undefined){
      contract.accessPolicy._rules[i].accessedRole = reviverList(obj)

    }
   
    //retrive byRole
    obj = object.accessPolicy._rules[i].byRole
    if(obj != undefined){
      contract.accessPolicy._rules[i].byRole =  reviverList(obj)

    }

    ////console.log("objjjjjjjjjjjjjjjjjjjjjjjjjjjj")
    ////console.log(contract.accessPolicy._rules[i].accessedRole)
    ////console.log(contract.accessPolicy._rules[i].byRole)

  }
  

   //AC add controller for ac policy 
   //contract.accessPolicy._controller = []
   //for(obj of object.accessPolicy._controller){
    //contract.accessPolicy.addController(reviverList(obj)) 
  //}


  ////////console.log("contract.regulator before retrurn contract")
  ////////console.log(contract.regulator)
  //contract.regulator.name = "regulator3"
  //contract.seller.name = "seller25"
  ////////console.log("contract.regulator before retrurn contract 2nd time")
  ////////console.log(contract.regulator)
  ////////console.log("contract.accessPolicy._rules")
  ////////console.log(contract.accessPolicy._rules)
  //////console.log("contract.goods.quantity")
  //////console.log(contract.goods.quantity)
  ////////console.log("contract.goods.quantity:", contract.goods.quantity)
  //////console.log("contract.goods.quantity._controller:", contract.goods.quantity._controller)
  //////////console.log("Roles")
  //////////console.log(contract._roles)
  



  return contract
}

function replacer(key, value) {   
  if (value === undefined) {     
    return "<undefined>";   }   
    return value;
   }


   function reviverList(aController) {  
    //AC
    //////////////console.log("inside function reviverList")
   // ////////////console.log(value)
    //////////////console.log(value._type)
   // ////////////console.log(contract.seller)
  
/*
  if(typeof aController !== 'undefined'){
    for (const key of ['seller','buyer', 'storage', 'regulator', 'shipper','delivered', 'paidLate', 'paid', 'disclosed','goods']){
      
    }
    let isController = this._controller.some(obj => obj._name === aController._name && obj._type === aController._type)

  }*/
  ////console.log("aController")
  ////console.log(aController)
  ////console.log("aController._name")
  ////console.log(aController._name)
  ////console.log("aController._type")
  ////console.log(aController._type)

  

  if(aController._name !== undefined && aController._name !== 'undefined' && aController !== null  &&  aController !== undefined){
    return contract.getRole(aController._name, aController._type)
  }else{
    return null
  }
  
/*
  switch (aController._type) {  
    case 'Seller': return contract.seller
    break  
    case 'Buyer': return contract.buyer
    break
    case 'Storage': return contract.storage
    break
    case 'Regulator': return contract.shipper
    break
    case 'Regulator': return contract.regulator
    break
    case 'Delivered': return contract.delivered
    break
    case 'Disclosed': return contract.disclosed
    break
    case 'Paid': return contract.paid
    break
    case 'PaidLate':return contract.paidLate
    break
    case  'Meat':return contract.meat
    break
    case 'Obligation':contract.obligation
    break
    case 'Power':return contract.power
    break
    case 'Rule': return contract.rule
    break
    case 'Resource':return contract.resource
    break
    case 'LegalSituation': return contract.legalSituation
  }*/
}
  
  function reviver(key, value) {   
    if (value === "<undefined>") {     
      return undefined;   
    }
    //////////////console.log("value from reviver") 
    //////////////console.log(value)
    //////////////console.log("value.type") 
   // ////////////console.log(value && value._type)
    /*
      if (value && value._type) {       
        const Constructor = classMap[value._type];     
        if (Constructor) {       
          return Object.assign(new Constructor(), value); 
        } 
      }*/
       return value; 
      }

//To solve the problem of circuling 
/*
function resolveReferences(obj) {
  const map = new Map();

  function recurse(value) {
    if (value && typeof value === 'object') {
      if ('$id' in value) {
        map.set(value.$id, value);
        delete value.$id;
      }
      for (const key in value) {
        if (typeof value[key] === 'object') {
          recurse(value[key]);
        }
      }
    }
  }

  recurse(obj);

  function replaceReferences(value) {
    if (value && typeof value === 'object') {
      if ('$ref' in value) {
        return map.get(value.$ref);
      }
      for (const key in value) {
        value[key] = replaceReferences(value[key]);
      }
    }
    return value;
  }

  return replaceReferences(obj);
}

//To solve the problem of circuling 
function getCircularReplacer() {
  const seen = new WeakMap();
  let id = 0;

  return function (key, value) {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) {
        return { $ref: seen.get(value) }; // Replace with a reference
      }
      const newId = id++;
      seen.set(value, newId);
      return { ...value, $id: newId }; // Add a unique ID
    }
    return value;
  };
}
*/

function serialize(contract) {
  for (const key of Object.keys(contract.obligations)){
    contract.obligations[key].contract = undefined
    contract.obligations[key].creditor = undefined
    contract.obligations[key].debtor = undefined
  }

  for (const key of Object.keys(contract.powers)){
    contract.powers[key].contract = undefined
    contract.powers[key].creditor = undefined
    contract.powers[key].debtor = undefined
  }

  for (const key of Object.keys(contract.survivingObligations)){
    contract.survivingObligations[key].contract = undefined
    contract.survivingObligations[key].creditor = undefined
    contract.survivingObligations[key].debtor = undefined
  }
  ////To solve the problem of circuling we call getCircularReplacer()
  //return JSON.stringify(contract,getCircularReplacer(), 2)
  //return JSON.stringify(contract)
  ////////////////console.log("before stringify")
  //let JSONstrigyfy = stringify(contract, null, 2)
  //////////////////console.log(JSONstrigyfy)

  return stringify(contract, replacer, 2); //stringify(contract, null, 2)
  
  


}

module.exports.deserialize = deserialize
module.exports.serialize = serialize
