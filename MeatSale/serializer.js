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




let contract = null

function deserialize(data) {
  // here we change the the way to parese the data to solve the problem of circuling: we use ...
  // customize function of circuling that add ref to the object that has circiling insdie it
  
  let object = parse(data,reviver);//JSON.parse(data)


  contract = new MeatSale(object.buyer, object.seller, object.regulator, object.qnt, object.qlt, object.amt, object.curr, object.payDueDate, object.delAdd, object.effDate, object.delDueDateDays, object.interestRate)

  
  //add all rules to this._roles

  for(obj of object._roles){
    contract.addRole(obj)
  }

  contract.state = object.state
  contract.activeState = object.activeState



  
  //AC for genrtaing certificate for each user, use name as an enrollment ID
  contract.userList = object.userList
  //////////////////console.log(contract.userList)

  //AC- acpolicy
  const ac = new ACPolicy()
  
  contract.accessPolicy = ac

    
    for (const key of Object.keys(object)) {
      if(key !== 'obligations' && key !== 'powers'){
     
      if (typeof object[key] === 'object' && object[key] !== null && !Array.isArray(object[key])) {
        
        for(const eKey of Object.keys(object[key])) {
         
           if(typeof  object[key][eKey] === 'object' &&  object[key][eKey] !== null){
                
           if(object[key][eKey]._type === 'Attribute'){
             contract[key][eKey]._value = object[key][eKey]._value
     
     
           }else{
             //if it is a list but it is not controller, bring it back
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

        }
      }
    }

  contract.accessPolicy._rules = object.accessPolicy._rules
  
  // internal events
  for (const eventType of Object.keys(InternalEventType.contract)) {
    if (object._events[eventType] != null) {
      const eventObject = new Event()
      eventObject._triggered = object._events[eventType]._triggered
      eventObject._timestamp = object._events[eventType]._timestamp
      contract._events[eventType] = eventObject
    }
  }

  if (object.obligations.latePayment != null) {
    const obligation = new Obligation('latePayment', contract.seller, contract.buyer, contract)
    obligation.state = object.obligations.latePayment.state
    obligation.activeState = object.obligations.latePayment.activeState
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
  if (object.obligations.delivery != null) {
    const obligation = new Obligation('delivery', contract.storage, contract.seller, contract)//contract.obligations.delivery.performer.pop() //object.obligations.delivery.Controller
    obligation.state = object.obligations.delivery.state
    //sofana-CA
    /*
    obligation._controller = object.obligations.delivery._controller;
    obligation._performer = object.obligations.delivery._performer
    obligation._rightHolder = object.obligations.delivery._rightHolder
    obligation._liable = object.obligations.delivery._liable
    */
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
  if (object.powers.suspendDelivery != null) {
    const power = new Power('suspendDelivery', contract.seller, contract.seller, contract)
    power.state = object.powers.suspendDelivery.state
    power.activeState = object.powers.suspendDelivery.activeState
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

    power.activeState = object.powers.terminateContract.activeState
    //Sofana-AC

    power.consequent = object.powers.terminateContract.consequent
    power.antecedent = object.powers.terminateContract.antecedent
    
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
  
  
  
  contract.seller._controller = []
  contract.delivered._controller = []
  contract.shipper._controller = []
 
 
//add all powers and obligations and same things for performer

 const contractList = ['seller','buyer', 'storage', 'regulator', 'shipper','delivered', 'paidLate', 'paid', 'disclosed','goods','accessPolicy']
 


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

         //retrive and add controller to attributes 
         
         for (const eKey of Object.keys(object[key])) { 
          //if (eKey !== undefined && eKey !== null) { 
              let attr = object[key][eKey]
             
              if(typeof attr === 'object' && attr !== null){
             
              if(attr._type === 'Attribute'){
                
                contract[key][eKey]._controller = []
                for(const valuet of object[key][eKey]._controller) {
                  contract[key][eKey].addController(reviverList(valuet)) 

             
                }
   
              }

              }
              
            

          //}
      }


      

      }
}


//retrive all obligation and add controllers, performers and so on
for (const key of Object.keys(contract.obligations)){

        contract.obligations[key]._controller = []
        for(const valuet of object.obligations[key]._controller) {
          contract.obligations[key].addController(reviverList(valuet)) 

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


   //add controller to contract 
   contract._controller = []
   for(obj of object._controller){
    contract.addController(reviverList(obj)) 
  }

  //retrive all rules of all resourcers 
  contract.accessPolicy._rules = object.accessPolicy._rules

  for (let i = 0; i < object.accessPolicy._rules.length; i++) {
    let obj = object.accessPolicy._rules[i].accessedResource 

    //retrive rules of obligation and power
    if(object.accessPolicy._rules[i].accessedResource._type.toLowerCase() === 'obligation' || object.accessPolicy._rules[i].accessedResource._type.toLowerCase() === 'power'){
      contract.accessPolicy._rules[i].accessedResource = contract.findLegalPosition(obj.name, obj._type, contract)
    }else{//worked and retrive rules for all resources acccept resources.attribute is in the else
      if(contract[obj._name] != undefined){
        contract.accessPolicy._rules[i].accessedResource = contract[obj._name]  //findObject(obj._name, obj._type, contract)
      }else{

        contract.accessPolicy._rules[i].accessedResource = contract[obj._parent][obj._name]
           
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

 

  }


  return contract
}

function replacer(key, value) {   
  if (value === undefined) {     
    return "<undefined>";   }   
    return value;
   }


   function reviverList(aController) {  

  if(aController._name !== undefined && aController._name !== 'undefined' && aController !== null  &&  aController !== undefined){
    return contract.getRole(aController._name, aController._type)
  }else{
    return null
  }

}
  
  function reviver(key, value) {   
    if (value === "<undefined>") {     
      return undefined;   
    }
       return value; 
      }


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


  return stringify(contract, replacer, 2); //stringify(contract, null, 2)
  
  


}

module.exports.deserialize = deserialize
module.exports.serialize = serialize
