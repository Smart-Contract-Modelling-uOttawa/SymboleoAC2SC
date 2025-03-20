const { LegalSituation,InternalEventSource, InternalEvent, InternalEventType } = require("symboleo-js-core")
const { Obligation } = require("symboleo-js-core")
const { Power } = require("symboleo-js-core")
const { Predicates } = require("symboleo-js-core")
//AC
const { Resource } = require("symboleo-js-core")
const { ACPolicy } = require("/Users/sfuhaid/Symboleo2SC-demo-mainFunctionACcore/node_modules/symboleo-js-core/core/ACPolicy.js")
//
const { Utils } = require("symboleo-js-core")
const { Str } = require("symboleo-js-core")
const { Currency } = require("./domain/types/Currency.js")
const { MeatQuality } = require("./domain/types/MeatQuality.js")

const EventListeners = {
  //AC
  //*** for code generation genrate adding legalsiutation  including anteceident and consequent, add if undefined as condition if its true and there is no anticident  */
  createObligation_latePayment(contract) { 
    if (Predicates.happens(contract.obligations.payment && contract.obligations.payment._events.Violated) ) { 
      if (contract.obligations.latePayment == null || contract.obligations.latePayment.isFinished()) {
        const isNewInstance =  contract.obligations.latePayment != null && contract.obligations.latePayment.isFinished()
        //AC
        const latePaymentConsequentAntecedent = new LegalSituation();
        //this.latePaymentConsequentAntecedent.addConsequentOf()

        contract.obligations.latePayment = new Obligation('latePayment', contract.seller, contract.buyer, contract, latePaymentConsequentAntecedent)
        //console.log("After create latePayment obligation")
        if (true ) { //true
          //console.log("I am inside if (true) latePayment obligation")
          contract.obligations.latePayment.trigerredUnconditional()
          if (!isNewInstance && Predicates.happens(contract.paidLate) ) { 
            console.log("I am inside if (isNewInstance) latePayment obligation")
            contract.obligations.latePayment.fulfilled()
          }
        } else {
          contract.obligations.latePayment.trigerredConditional()
        }
      }
    }
  },
  createPower_resumeDelivery(contract) {
    const effects = { powerCreated: false } 
    if (Predicates.happensWithin(contract.paidLate, contract.obligations.delivery, "Obligation.Suspension") ) { 
      if (contract.powers.resumeDelivery == null || contract.powers.resumeDelivery.isFinished()){
        const isNewInstance =  contract.powers.resumeDelivery != null && contract.powers.resumeDelivery.isFinished()
        contract.powers.resumeDelivery = new Power('resumeDelivery', contract.buyer, contract.seller, contract)
        effects.powerCreated = true
        effects.powerName = 'resumeDelivery'
        if (true ) { 
          contract.powers.resumeDelivery.trigerredUnconditional()
        } else {
          contract.powers.resumeDelivery.trigerredConditional()
        }
      }
    }
    return effects
  },
  createPower_suspendDelivery(contract) {
    const effects = { powerCreated: false } 
    if (Predicates.happens(contract.obligations.payment && contract.obligations.payment._events.Violated) ) { 
      if (contract.powers.suspendDelivery == null || contract.powers.suspendDelivery.isFinished()){
        const isNewInstance =  contract.powers.suspendDelivery != null && contract.powers.suspendDelivery.isFinished()
        contract.powers.suspendDelivery = new Power('suspendDelivery', contract.seller, contract.buyer, contract)
        //CA-Sofana
        ////console.log("power controller from events.js")
        ////console.log(contract.powers.suspendDelivery._controller)  

        effects.powerCreated = true
        effects.powerName = 'suspendDelivery'
        if (true ) { 
          contract.powers.suspendDelivery.trigerredUnconditional()
        } else {
          contract.powers.suspendDelivery.trigerredConditional()
        }
        //CA-Sofana --> Add rules for condiitonal powers 
        contract.accessPolicy.addRulee('Read', contract.powers.suspendDelivery, contract.seller) //pre-authorized 
        contract.accessPolicy.addRulee('Read', contract.powers.suspendDelivery, contract.buyer) //pre-authorized 
        contract.accessPolicy.addRulee('Read', contract.powers.suspendDelivery, contract.shipper) //give permession
        //console.log("printing rules from policy in events.js for conditional power");
        //console.log(contract.accessPolicy);

      }
    }
    return effects
  },
  createPower_terminateContract(contract) {
    const effects = { powerCreated: false } 
    if (Predicates.happens(contract.obligations.delivery && contract.obligations.delivery._events.Violated) ) { 
      if (contract.powers.terminateContract == null || contract.powers.terminateContract.isFinished()){
        const isNewInstance =  contract.powers.terminateContract != null && contract.powers.terminateContract.isFinished()
        contract.powers.terminateContract = new Power('terminateContract', contract.buyer, contract.seller, contract)
        effects.powerCreated = true
        effects.powerName = 'terminateContract'
        if (true ) { 
          contract.powers.terminateContract.trigerredUnconditional()
        } else {
          contract.powers.terminateContract.trigerredConditional()
        }
      }
    }
    return effects
  },
  fulfillObligation_latePayment(contract) { 
    if (contract.obligations.latePayment != null && (Predicates.happens(contract.paidLate) ) ) { 
      contract.obligations.latePayment.fulfilled()
    }
  },
  fulfillObligation_payment(contract) { 
    if (contract.obligations.payment != null && (Predicates.weakHappensBefore(contract.paid, contract.paid.payDueDate._value) ) ) { 
      contract.obligations.payment.fulfilled()
    }
  },//AC****code genration to adjust conditions as instance of attribute for all varibales 
  fulfillObligation_delivery(contract) { 
      //
      //console.log("before printing performer and controller for delivered from events&&&&&&&&&&&&&&&&&")
      //console.log(contract.delivered._performer)
      //console.log(contract.delivered.Controller)
      //
    ////console.log("fulfillObligation_delivery: I am in events.js (1):  ####......... \n", contract)
    //console.log("To print controller" + contract.obligations.delivery.getController());
    //console.log("I am before fulfillObligation_deliver")
    //console.log(contract.delivered.delDueDate._value)
    if (contract.obligations.delivery != null && (Predicates.weakHappensBefore(contract.delivered, contract.delivered.delDueDate._value) ) ) { 
      //console.log("I am inside fulfillObligation_deliver")
     contract.obligations.delivery.fulfilled()
    }
      //
      //console.log("after printing performer and controller for delivered event&&&&&&&&&&&&&&&&&")
      //console.log(contract.delivered._performer)
      //console.log(contract.delivered.Controller)
      //
  },
  successfullyTerminateContract(contract) {
    for (const oblKey of Object.keys(contract.obligations)) {
      if (contract.obligations[oblKey].isActive()) {
        return;
      }
      if (contract.obligations[oblKey].isViolated() && Array.isArray(contract.obligations[oblKey]._createdPowerNames)) {
        for (const pKey of contract.obligations[oblKey]._createdPowerNames) {
          if (!contract.powers[pKey].isSuccessfulTermination()) {
            return;
          }
        }
      }
    }
    contract.fulfilledActiveObligations()
  },
  unsuccessfullyTerminateContract(contract) {
    for (let index in contract.obligations) { 
      contract.obligations[index].terminated({emitEvent: false})
    }
    for (let index in contract.powers) {
      contract.powers[index].terminated()
    }
    contract.terminated()
  }     
}

function getEventMap(contract) {
  return [
    [[new InternalEvent(InternalEventSource.obligation, InternalEventType.obligation.Violated, contract.obligations.payment), ], EventListeners.createObligation_latePayment],
    [[new InternalEvent(InternalEventSource.contractEvent, InternalEventType.contractEvent.Happened, contract.paidLate), ], EventListeners.createPower_resumeDelivery],
    [[new InternalEvent(InternalEventSource.obligation, InternalEventType.obligation.Violated, contract.obligations.payment), ], EventListeners.createPower_suspendDelivery],
    [[new InternalEvent(InternalEventSource.obligation, InternalEventType.obligation.Violated, contract.obligations.delivery), ], EventListeners.createPower_terminateContract],
    [[new InternalEvent(InternalEventSource.contractEvent, InternalEventType.contractEvent.Happened, contract.paidLate), ], EventListeners.fulfillObligation_latePayment],
    [[new InternalEvent(InternalEventSource.contractEvent, InternalEventType.contractEvent.Happened, contract.paid), ], EventListeners.fulfillObligation_payment],
    [[new InternalEvent(InternalEventSource.contractEvent, InternalEventType.contractEvent.Happened, contract.delivered),], EventListeners.fulfillObligation_delivery],
  ]
}

module.exports.EventListeners = EventListeners
module.exports.getEventMap = getEventMap
