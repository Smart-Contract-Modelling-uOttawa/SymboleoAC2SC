const { LegalSituation, InternalEventSource, InternalEvent, InternalEventType } = require("symboleoac-js-core")
const { Obligation } = require("symboleoac-js-core")
const { Power } = require("symboleoac-js-core")
const { Predicates } = require("symboleoac-js-core")
const { Utils } = require("symboleoac-js-core")
const { Str } = require("symboleoac-js-core")
const { Currency } = require("./domain/types/Currency.js")
const { MeatQuality } = require("./domain/types/MeatQuality.js")
const { ACPolicy } = require("symboleoac-js-core")
const { Resource } = require("symboleoac-js-core")

const EventListeners = {
  createObligation_latePayment(contract) {
    if (Predicates.happens(contract.obligations.payment && contract.obligations.payment._events.Violated) ) { 
      if (contract.obligations.latePayment == null || contract.obligations.latePayment.isFinished()) {
        const isNewInstance =  contract.obligations.latePayment != null && contract.obligations.latePayment.isFinished()
        contract.latePaymentSituation = new LegalSituation();

contract.latePaymentSituation.addConsequentOf({_type: 'eventCondition', resource:"paidLate", resourceType:"PaidLate"} )
         contract.obligations.latePayment = new Obligation('latePayment', contract.seller, contract.buyer, contract, contract.latePaymentSituation)
        if (true ) { 
          contract.obligations.latePayment.trigerredUnconditional()
          if (!isNewInstance && Predicates.happens(contract.paidLate) ) { 
            contract.obligations.latePayment.fulfilled()
          }
        } else {
          contract.obligations.latePayment.trigerredConditional()
        }
      }
    }
  },
  createObligation_inspectMeat(contract) {
    if (Predicates.happens(contract.delivered) ) { 
      if (contract.obligations.inspectMeat == null || contract.obligations.inspectMeat.isFinished()) {
        const isNewInstance =  contract.obligations.inspectMeat != null && contract.obligations.inspectMeat.isFinished()
        contract.inspectMeatSituation = new LegalSituation();

contract.inspectMeatSituation.addConsequentOf({_type: 'eventCondition', resource:"inspectedQuality", resourceType:"InspectedQuality"} )
 contract.inspectMeatSituation.addConsequentOf({ leftSide:'this.inspectedQuality.barFound._value', op:'===', rightSide: 'this.goods.barcode._value', _type: 'Condition'})
 contract.inspectMeatSituation.addConsequentOf({ leftSide:'this.inspectedQuality.qualityFound._value', op:'===', rightSide: 'this.goods.quality._value', _type: 'Condition'})
 contract.inspectMeatSituation.addConsequentOf({ leftSide:'this.inspectedQuality.quantityFound._value', op:'===', rightSide: 'this.goods.quantity._value', _type: 'Condition'})
        
        contract.inspectMeatSituation.addAntecedentOf({_type: 'eventCondition', resource:"passwordNotification", resourceType:"PasswordNotification"} )
         contract.obligations.inspectMeat = new Obligation('inspectMeat', contract.buyer, contract.assessor, contract, contract.inspectMeatSituation)
        if (!isNewInstance  ) { 
          contract.obligations.inspectMeat.trigerredUnconditional()
          if (!isNewInstance && Predicates.happens(contract.inspectedQuality)  && contract.inspectedQuality.barFound._value===contract.goods.barcode._value && contract.inspectedQuality.qualityFound._value===contract.goods.quality._value && contract.inspectedQuality.quantityFound._value===contract.goods.quantity._value) { 
            contract.obligations.inspectMeat.fulfilled()
          }
        } else {
          contract.obligations.inspectMeat.trigerredConditional()
        }
      }
    }
  },
  createPower_resumeDelivery(contract) {
    const effects = { powerCreated: false }
    if (Predicates.happensWithin(contract.paidLate, contract.obligations.delivery, "Obligation.Suspension") ) { 
      if (contract.powers.resumeDelivery == null || contract.powers.resumeDelivery.isFinished()){
        const isNewInstance =  contract.powers.resumeDelivery != null && contract.powers.resumeDelivery.isFinished()
        contract.resumeDeliverySituation = new LegalSituation();            
                    	this.resumeDeliverySituation.addConsequentOf({_type: 'stateCondition',resourceType: 'obligation', resource: 'delivery', state:'suspension'})
        contract.powers.resumeDelivery = new Power('resumeDelivery', contract.buyer, contract.seller, contract, contract.resumeDeliverySituation)
        effects.powerCreated = true
        effects.powerName = 'resumeDelivery'
        contract.accessPolicy.addRulee("grant", "write", contract.powers.resumeDelivery, contract.transportCo, contract.seller)
        if (true ) { 
          contract.powers.resumeDelivery.trigerredUnconditional()
        } else {
          contract.powers.resumeDelivery.trigerredConditional()
        }
      }
    }
    return effects
  },
  createPower_terminateContract(contract) {
    const effects = { powerCreated: false }
    if (Predicates.happens(contract.obligations.delivery && contract.obligations.delivery._events.Violated) ) { 
      if (contract.powers.terminateContract == null || contract.powers.terminateContract.isFinished()){
        const isNewInstance =  contract.powers.terminateContract != null && contract.powers.terminateContract.isFinished()
        contract.terminateContractSituation = new LegalSituation();            
                    	this.terminateContractSituation.addConsequentOf({_type: 'stateCondition',resourceType: 'contract', resource: 'contract', state:'unsuccessfultermination'})
        contract.powers.terminateContract = new Power('terminateContract', contract.buyer, contract.seller, contract, contract.terminateContractSituation)
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
  createPower_suspendDelivery(contract) {
    const effects = { powerCreated: false }
    if (Predicates.happens(contract.obligations.payment && contract.obligations.payment._events.Violated) ) { 
      if (contract.powers.suspendDelivery == null || contract.powers.suspendDelivery.isFinished()){
        const isNewInstance =  contract.powers.suspendDelivery != null && contract.powers.suspendDelivery.isFinished()
        contract.suspendDeliverySituation = new LegalSituation();            
                    	this.suspendDeliverySituation.addConsequentOf({_type: 'stateCondition',resourceType: 'obligation', resource: 'delivery', state:'suspension'})
        contract.powers.suspendDelivery = new Power('suspendDelivery', contract.seller, contract.buyer, contract, contract.suspendDeliverySituation)
        effects.powerCreated = true
        effects.powerName = 'suspendDelivery'
        this.powers.suspendDelivery.addController(this.seller)
        contract.accessPolicy.addRulee("grant", "write", contract.powers.suspendDelivery, contract.transportCo, contract.seller)
        if (true ) { 
          contract.powers.suspendDelivery.trigerredUnconditional()
        } else {
          contract.powers.suspendDelivery.trigerredConditional()
        }
      }
    }
    return effects
  },
  activateObligation_payment(contract) {
    if (contract.obligations.payment != null && (Predicates.happens(contract.unLoaded) )) { 
      contract.obligations.payment.activated()
                    if (Predicates.weakHappensBefore(contract.paid, contract.paid.payDueDate._value) ) { 
                      contract.obligations.payment.fulfilled()
                    }
                  }
                },
  activateObligation_inspectMeat(contract) {
    if (contract.obligations.inspectMeat != null && (Predicates.happens(contract.passwordNotification) )) { 
      contract.obligations.inspectMeat.activated()
                    if (Predicates.happens(contract.inspectedQuality)  && contract.inspectedQuality.barFound._value===contract.goods.barcode._value && contract.inspectedQuality.qualityFound._value===contract.goods.quality._value && contract.inspectedQuality.quantityFound._value===contract.goods.quantity._value) { 
                      contract.obligations.inspectMeat.fulfilled()
                    }
                  }
                },
                fulfillObligation_payment(contract) {
                  if (contract.obligations.payment != null && (Predicates.weakHappensBefore(contract.paid, contract.paid.payDueDate._value) ) ) { 
                    contract.obligations.payment.fulfilled()
                  }
                },
                fulfillObligation_latePayment(contract) {
                  if (contract.obligations.latePayment != null && (Predicates.happens(contract.paidLate) ) ) { 
                    contract.obligations.latePayment.fulfilled()
                  }
                },
                fulfillObligation_inspectMeat(contract) {
                  if (contract.obligations.inspectMeat != null && (Predicates.happens(contract.inspectedQuality)  && contract.inspectedQuality.barFound._value===contract.goods.barcode._value && contract.inspectedQuality.qualityFound._value===contract.goods.quality._value && contract.inspectedQuality.quantityFound._value===contract.goods.quantity._value) ) { 
                    contract.obligations.inspectMeat.fulfilled()
                  }
                },
                fulfillObligation_delivery(contract) {
                  if (contract.obligations.delivery != null && (Predicates.weakHappensBefore(contract.delivered, contract.delivered.delDueDate._value)  && contract.delivered.deliveryAddress._value===contract.buyer.warehouse._value) ) { 
                    contract.obligations.delivery.fulfilled()
                  }
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
                  [[new InternalEvent(InternalEventSource.contractEvent, InternalEventType.contractEvent.Happened, contract.delivered), ], EventListeners.createObligation_inspectMeat],
                  [[new InternalEvent(InternalEventSource.contractEvent, InternalEventType.contractEvent.Happened, contract.paidLate), ], EventListeners.createPower_resumeDelivery],
                  [[new InternalEvent(InternalEventSource.obligation, InternalEventType.obligation.Violated, contract.obligations.delivery), ], EventListeners.createPower_terminateContract],
                  [[new InternalEvent(InternalEventSource.obligation, InternalEventType.obligation.Violated, contract.obligations.payment), ], EventListeners.createPower_suspendDelivery],
                  [[new InternalEvent(InternalEventSource.contractEvent, InternalEventType.contractEvent.Happened, contract.unLoaded), ], EventListeners.activateObligation_payment],
                  [[new InternalEvent(InternalEventSource.contractEvent, InternalEventType.contractEvent.Happened, contract.passwordNotification), ], EventListeners.activateObligation_inspectMeat],
                  [[new InternalEvent(InternalEventSource.contractEvent, InternalEventType.contractEvent.Happened, contract.paid), ], EventListeners.fulfillObligation_payment],
                  [[new InternalEvent(InternalEventSource.contractEvent, InternalEventType.contractEvent.Happened, contract.paidLate), ], EventListeners.fulfillObligation_latePayment],
                  [[new InternalEvent(InternalEventSource.contractEvent, InternalEventType.contractEvent.Happened, contract.inspectedQuality), ], EventListeners.fulfillObligation_inspectMeat],
                  [[new InternalEvent(InternalEventSource.contractEvent, InternalEventType.contractEvent.Happened, contract.delivered), ], EventListeners.fulfillObligation_delivery],
                ]
              }
              
              module.exports.EventListeners = EventListeners
              module.exports.getEventMap = getEventMap
