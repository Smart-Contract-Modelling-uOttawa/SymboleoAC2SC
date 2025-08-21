   //Flat library to solve the circular problem when stringifying node objects
   const {stringify, parse } = require('flatted')
   const { MeatSale } = require("./domain/contract/MeatSale.js")
   const { Obligation, ObligationActiveState, ObligationState } = require("symboleoac-js-core")
   const { InternalEventType, InternalEvent, InternalEventSource} = require("symboleoac-js-core")
   const { Event } = require("symboleoac-js-core")
   const { Power } = require("symboleoac-js-core")
   const { ACPolicy } = require("symboleoac-js-core")
   
   let contract = null
   
   function deserialize(data) {
      let object = parse(data,reviver);
     // to update all the assign variable with the new value. We check the type of the variable before assiging the new value
     contract = new MeatSale(object.buyerP,object.sellerP,object.transportCoP,object.assessorP,object.regulatorP,object.storageP,object.shipperP,object.adminP,object.barcodeP,object.qnt,object.qlt,object.amt,object.curr,object.payDueDate,object.delAdd,object.effDate,object.delDueDateDays,object.interestRate)
   contract.state = object.state
   contract.activeState = object.activeState
     
   // Add roles to role list
   for(obj of object._roles){
     contract.addRole(obj)
   }
   
   // Remove roles that were removed at runtime as initiating the contract genrates the same roles at design time
   let toRemoveRole = []
   for (let i = 0; i < contract._roles.length; i++) {
      let isRole = false
    
      if (contract._roles[i] !== undefined) {
      isRole = object._roles.some(obj => obj._name === contract._roles[i]._name && obj._type === contract._roles[i]._type)
   }
  
   if (!isRole) {
      toRemoveRole.push(contract._roles[i])
     }
   }

   contract._roles = contract._roles.filter(
     item => !toRemoveRole.some(
       other => other._name === item._name && other._type === item._type
     )
   );

   //AC for genrtaing certificate for each user, use name as an enrollment ID
   contract.userList = object.userList

   //AC- acpolicy
   const ac = new ACPolicy()
  
   //ac = object.accessPolicy
   contract.accessPolicy = ac  

   //return all objects 
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
                 		
                   		if(contract[key][eKey] !=  undefined){
                   		      contract[key][eKey] = object[key][eKey]
                   		}
                 		}
                                 
               }else{//return objects that does not have name 
                 if(contract[object[key][eKey]] !=  undefined){
                                 contract[key][eKey] = object[key][eKey]
                               }
               }
               
             }
           }
            
           }else{//string/numerical and so on 
             if(contract[object[key][eKey]] !=  undefined){
                           contract[key][eKey] = object[key][eKey]
                 }
             }
          }//nested for
        }
      }
   }
    

   contract.accessPolicy._rules = object.accessPolicy._rules
   // internal events (violated, suspended, ..)     
     for (const eventType of Object.keys(InternalEventType.contract)) {
       if (object._events[eventType] != null) {
         const eventObject = new Event()
         eventObject._triggered = object._events[eventType]._triggered
         eventObject._timestamp = object._events[eventType]._timestamp
         contract._events[eventType] = eventObject
       }
     }

   if (object.obligations.inspectMeat != null) {
       const obligation = new Obligation('inspectMeat', contract.buyer, contract.assessor, contract)
       obligation.state = object.obligations.inspectMeat.state
       obligation.activeState = object.obligations.inspectMeat.activeState
       obligation.consequent = object.obligations.inspectMeat.consequent
       obligation.antecedent = object.obligations.inspectMeat.antecedent
       obligation._createdPowerNames = object.obligations.inspectMeat._createdPowerNames
       obligation._suspendedByContractSuspension = object.obligations.inspectMeat._suspendedByContractSuspension
       for (const eventType of Object.keys(InternalEventType.obligation)) {
         if (object.obligations.inspectMeat._events[eventType] != null) {
           const eventObject = new Event()
           eventObject._triggered = object.obligations.inspectMeat._events[eventType]._triggered
           eventObject._timestamp = object.obligations.inspectMeat._events[eventType]._timestamp
           obligation._events[eventType] = eventObject
         }
       }
       contract.obligations.inspectMeat = obligation
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
   }
   if (object.obligations.delivery != null) {
       const obligation = new Obligation('delivery', contract.buyer, contract.seller, contract)
       obligation.state = object.obligations.delivery.state
       obligation.activeState = object.obligations.delivery.activeState
       obligation.consequent = object.obligations.delivery.consequent
       obligation.antecedent = object.obligations.delivery.antecedent
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
   }
   if (object.obligations.payment != null) {
       const obligation = new Obligation('payment', contract.seller, contract.buyer, contract)
       obligation.state = object.obligations.payment.state
       obligation.activeState = object.obligations.payment.activeState
       obligation.consequent = object.obligations.payment.consequent
       obligation.antecedent = object.obligations.payment.antecedent
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
       power.consequent = object.powers.resumeDelivery.consequent
       power.antecedent = object.powers.resumeDelivery.antecedent
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
   const contractList=['seller','buyer','transportCo','assessor','regulator','storage','shipper','admin','goods','delivered','paidLate','paid','passwordNotification','inspectedQuality','unLoaded','accessPolicy']  
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
                          let attr = object[key][eKey]
                          if(typeof attr === 'object' && attr !== null){
                          if(attr._type === 'Attribute'){
                            contract[key][eKey]._controller = []
                             for(const valuet of object[key][eKey]._controller) {
                             contract[key][eKey].addController(reviverList(valuet)) 
                           }
                         }
           
                         }
           
                 }
           
                 }
         }  
  //retrive all obligation and add controllers, performers and so on
  for (const key of Object.keys(contract.obligations)){
          contract.obligations[key]._controller = []
          for(const valuet of object.obligations[key]._controller) {
            contract.obligations[key].addController(reviverList(valuet)) 
           }
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
    contract.accessPolicy._rules = []
      for (let i = 0; i < object.accessPolicy._rules.length; i++) {
       
      let obj = object.accessPolicy._rules[i].accessedResource
      let accessedResource = obj
          //retrive rules of obligation and power
      if(object.accessPolicy._rules[i].accessedResource._type.toLowerCase() === 'obligation' || object.accessPolicy._rules[i].accessedResource._type.toLowerCase() === 'power'){
         accessedResource = contract.findLegalPosition(obj.name, obj._type, contract)
      }else{//worked and retrive rules for all resources acccept resources.attribute is in the else
          if(contract[obj._name] != undefined){
           accessedResource = contract[obj._name]
        }else{
           accessedResource = contract[obj._parent][obj._name]
         
        }
      }
      //retrive accessedRole
      obj = object.accessPolicy._rules[i].accessedRole
      let accessedRole=obj
      if(obj != undefined){
         accessedRole = reviverList(obj)
      }
      //retrive byRole
      obj = object.accessPolicy._rules[i].byRole
      let byRole =  obj
      if(obj != undefined){
        byRole =  reviverList(obj)
      }
  
        contract.accessPolicy.addRulee(object.accessPolicy._rules[i].decision,object.accessPolicy._rules[i].permission, accessedResource, accessedRole, byRole)//worked, added to rules
    }
   
     
     return contract
   }
   // to stringify the contract
   function replacer(key, value) {   
     if (value === undefined) {     
        return "<undefined>";   }   
      return value;
    }
   // return roles' objects from contract that are equavelent to the roles' objects in the object after parsing contract data (let object = parse(data,reviver)) 
   function reviverList(aController) {  
 
   if(aController._name !== undefined && aController._name !== 'undefined' && aController !== null  &&  aController !== undefined){
     return contract.getRole(aController._name, aController._type)
   }else{
     return null
   }
   
 }
   // used in pars function to unify the undefined values  
   function reviver(key, value) {   
     if (value === "<undefined>") {     
       return undefined;   
     }
        return value; 
       }
 
 function serialize(contract) {
   for (const key of Object.keys(contract.obligations)){
     contract.obligations[key].contract = undefined
   }
 
   for (const key of Object.keys(contract.powers)){
     contract.powers[key].contract = undefined
   }
 
   for (const key of Object.keys(contract.survivingObligations)){
     contract.survivingObligations[key].contract = undefined
   }
  
   return stringify(contract, replacer, 2); // instead of stringify(contract, null, 2) to solve circular issue when pars the contract
  
 }
 
 module.exports.deserialize = deserialize
 module.exports.serialize = serialize
