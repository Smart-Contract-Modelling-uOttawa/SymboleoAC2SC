const { Contract } = require("fabric-contract-api") 
const { MeatSale } = require("./domain/contract/MeatSale.js")
const { deserialize, serialize } = require("./serializer.js")
const { Events } = require("symboleo-js-core")
const { InternalEvent, InternalEventSource, InternalEventType } = require("symboleo-js-core")
const { getEventMap, EventListeners } = require("./events.js")

const {stringify, parse } = require("/Users/sfuhaid/Symboleo2SC-demo-mainFunctionACcore/node_modules/flatted/cjs/index.js");
const { Rule } = require("/Users/sfuhaid/Symboleo2SC-demo-mainFunctionACcore/node_modules/symboleo-js-core/core/Rule.js")
const { error } = require("fabric-shim")

class HFContract extends Contract {
  
  constructor() {
    super('MeatSale');
  }

  initialize(contract) {
    Events.init(getEventMap(contract), EventListeners)
  }

  async init(ctx, args) {
  	const inputs = JSON.parse(args);
    const contractInstance = new MeatSale (inputs.buyer, inputs.seller,inputs.regulator, inputs.qnt, inputs.qlt, inputs.amt, inputs.curr, inputs.payDueDate, inputs.delAdd, inputs.effDate, inputs.delDueDateDays, inputs.interestRate)
    this.initialize(contractInstance)
    if (contractInstance.activated()) {
      // call trigger transitions for legal positions
      contractInstance.obligations.delivery.trigerredUnconditional()
      contractInstance.obligations.payment.trigerredUnconditional()
  
      await ctx.stub.putState(contractInstance.id, Buffer.from(serialize(contractInstance)))
  
      return {successful: true, contractId: contractInstance.id}
    } else {
      return {successful: false}
    }
  }

  async trigger_delivered(ctx, args) {
    ////////////console.log("I am in trigger_delivered ")
    const inputs = JSON.parse(args);
    //const inputs = parse(inputJ)
    const contractId = inputs.contractId;
    const event = inputs.event;
    //read form ledger
    const contractState = await ctx.stub.getState(contractId)
    
    if (contractState == null) {
      return {successful: false}
    }
    ////////////console.log("before deserialize -----------------------");
    ////////////console.log(contractState.toString())
    ////////////console.log("I am in trigger_delivered before deserialize ")
    const contract = deserialize(contractState.toString())
    ////////////console.log("I am in trigger_delivered after deserialize ")
    ////////////console.log("after deserialize -----------------------");
    ////////////console.log(contract)
    //sofana
    ////////////console.log("I am in index.js - function is trigger_delivered after deserialize (5) " + contract.obligations.delivery.state)
    //sofana
    this.initialize(contract)
    if (contract.isInEffect()){
      if(!contract.accessPolicy.hasPermesstion('grant','read', contract.delivered, contract.shipper, contract.shipper) || 
      !contract.accessPolicy.isValid(new Rule('grant','read', contract.delivered, contract.shipper, contract.shipper)) ){//|| contract.accessPolicy.hasPermesstionOnLegalPosition('Grant','read', contract.delivered, contract.seller, contract.seller,contract)
        //////////console.log("he has not")
        throw new Error(`access denied...`)
      }
      //////////console.log("he has access to trigger delivered")
      contract.delivered.happen(event)

      ////////////console.log("under Add Controller------------------------");
      Events.emitEvent(contract, new InternalEvent(InternalEventSource.contractEvent, InternalEventType.contractEvent.Happened, contract.delivered))
      ////////////console.log("under Emit Events------------------------");
      await ctx.stub.putState(contractId, Buffer.from(serialize(contract)))
      ////////////console.log("under putState------")
      //////////////console.log(contract.accessPolicy)
      ////////////console.log("contract.delivered from smart contract")
      ////////////console.log(contract.delivered._controller)
      ////////////console.log("contract.delivered._controller")
      ////////////console.log(contract.delivered._controller)
     // //////////console.log("contract.seller from smart contract")
      ////////////console.log(contract.seller)
      ////////////console.log("contract.seller._controller")
      ////////////console.log(contract.seller._controller)

      //////////////console.log(contract.goods._controller[0])
     
      return {successful: true}
    } else {
      return {successful: false}
    }
  }
  
  async trigger_paidLate(ctx, args) {
  	const inputs = JSON.parse(args);
  	const contractId = inputs.contractId;
  	const event = inputs.event;
    const contractState = await ctx.stub.getState(contractId)
    if (contractState == null) {
      return {successful: false}
    }
    const contract = deserialize(contractState.toString())
    this.initialize(contract)
    if (contract.isInEffect()  ){
      contract.paidLate.happen(event)
      Events.emitEvent(contract, new InternalEvent(InternalEventSource.contractEvent, InternalEventType.contractEvent.Happened, contract.paidLate))
      await ctx.stub.putState(contractId, Buffer.from(serialize(contract)))
      return {successful: true}
    } else {
      return {successful: false}
    }
  } 
  
  async trigger_paid(ctx, args) {
  	const inputs = JSON.parse(args);
  	const contractId = inputs.contractId;
  	const event = inputs.event;
    const contractState = await ctx.stub.getState(contractId)
    if (contractState == null) {
      return {successful: false}
    }
    const contract = deserialize(contractState.toString())
    this.initialize(contract)
    if (contract.isInEffect()){
      //AC
      if(!contract.accessPolicy.hasPermesstion('grant','read', contract.paid, contract.buyer, contract.buyer) || 
      !contract.accessPolicy.isValid(new Rule('grant','read', contract.paid, contract.buyer, contract.buyer)) ){//|| contract.accessPolicy.hasPermesstionOnLegalPosition('Grant','read', contract.delivered, contract.seller, contract.seller,contract)
        //////////console.log("he has not")
        throw new Error(`access denied...`)
      }
      contract.paid.happen(event)
      Events.emitEvent(contract, new InternalEvent(InternalEventSource.contractEvent, InternalEventType.contractEvent.Happened, contract.paid))
      await ctx.stub.putState(contractId, Buffer.from(serialize(contract)))
      return {successful: true}
    } else {
      return {successful: false}
    }
  }
  
  async trigger_disclosed(ctx, args) {
  	const inputs = JSON.parse(args);
  	const contractId = inputs.contractId;
  	const event = inputs.event;
    const contractState = await ctx.stub.getState(contractId)
    if (contractState == null) {
      return {successful: false}
    }
    const contract = deserialize(contractState.toString())
    this.initialize(contract)
    if (contract.isInEffect()  ){
      contract.disclosed.happen(event)
      Events.emitEvent(contract, new InternalEvent(InternalEventSource.contractEvent, InternalEventType.contractEvent.Happened, contract.disclosed))
      await ctx.stub.putState(contractId, Buffer.from(serialize(contract)))
      return {successful: true}
    } else {
      return {successful: false}
    }
  }
  
  async p_suspendDelivery_suspended_o_delivery(ctx, contractId) {
    const contractState = await ctx.stub.getState(contractId)
    if (contractState == null) {
      //////////console.log("I am inside first false in P_suspenddelivery")
      return {successful: false}
    }
    const contract = deserialize(contractState.toString())
    this.initialize(contract)
  
    if (contract.isInEffect() && contract.powers.suspendDelivery != null && contract.powers.suspendDelivery.isInEffect()) {
      const obligation = contract.obligations.delivery
      if (obligation != null && obligation.suspended() && contract.powers.suspendDelivery.exerted()) {
        await ctx.stub.putState(contractId, Buffer.from(serialize(contract)))
        return {successful: true}
      } else {
        //////////console.log("I am inside second false in P_suspenddelivery")
        return {successful: false}
      }
    } else {
      //////////console.log("I am inside third false in P_suspenddelivery")
      return {successful: false}
    }
  }
  
  async p_resumeDelivery_resumed_o_delivery(ctx, contractId) {
    const contractState = await ctx.stub.getState(contractId)
    if (contractState == null) {
      return {successful: false}
    }
    const contract = deserialize(contractState.toString())
    this.initialize(contract)
  
    if (contract.isInEffect() && contract.powers.resumeDelivery != null && contract.powers.resumeDelivery.isInEffect()) {
      const obligation = contract.obligations.delivery
      if (obligation != null && obligation.resumed() && contract.powers.resumeDelivery.exerted()) {
        await ctx.stub.putState(contractId, Buffer.from(serialize(contract)))
        return {successful: true}
      } else {
        return {successful: false}
      }
    } else {
      return {successful: false}
    }
  }
  
  async p_terminateContract_terminated_contract(ctx, contractId) {
    const contractState = await ctx.stub.getState(contractId)
    if (contractState == null) {
      return {successful: false}
    }
    const contract = deserialize(contractState.toString())
    this.initialize(contract)
  
    if (contract.isInEffect() && contract.powers.terminateContract != null && contract.powers.terminateContract.isInEffect()) {
      for (let index in contract.obligations) {
        const obligation = contract.obligations[index]
        obligation.terminated({emitEvent: false})
      }
      for (let index in contract.survivingObligations) {
        const obligation = contract.survivingObligations[index]
        obligation.terminated()
      }
      for (let index in contract.powers) {
        const power = contract.powers[index]
        if (index === 'terminateContract') {
          continue;
        }
        power.terminated()
      }        
      if (contract.terminated() && contract.powers.terminateContract.exerted()) {
        await ctx.stub.putState(contractId, Buffer.from(serialize(contract)))
        return {successful: true}
      } else {
        return {successful: false}
      }
    } else {
      return {successful: false}
    }
  }
  
  async violateObligation_latePayment(ctx, contractId) {
    const contractState = await ctx.stub.getState(contractId)
    if (contractState == null) {
      return {successful: false}
    }
    const contract = deserialize(contractState.toString())
    this.initialize(contract)
  
    if (contract.isInEffect()) {
      if (contract.obligations.latePayment != null && contract.obligations.latePayment.violated()) {      
        await ctx.stub.putState(contractId, Buffer.from(serialize(contract)))
        return {successful: true}
      } else {
        return {successful: false}
      }
    } else {
      return {successful: false}
    }
  }
  
  async violateObligation_delivery(ctx, contractId) {
    const contractState = await ctx.stub.getState(contractId)
    if (contractState == null) {
      return {successful: false}
    }
    const contract = deserialize(contractState.toString())
    this.initialize(contract)
  
    if (contract.isInEffect()) {
      if (contract.obligations.delivery != null && contract.obligations.delivery.violated()) {   
        await ctx.stub.putState(contractId, Buffer.from(serialize(contract)))
        return {successful: true}
      } else {
        return {successful: false}

      }
    } else {
      return {successful: false}
    }
  }
  
  async violateObligation_payment(ctx, contractId) {
    const contractState = await ctx.stub.getState(contractId)
    if (contractState == null) {
      return {successful: false}
    }
    const contract = deserialize(contractState.toString())
    this.initialize(contract)
    if (contract.isInEffect()) {
      ////////////console.log("Obligation.payment,violated")
      ////////////console.log(contract.obligations.payment)
      ////////////console.log(contract.obligations.payment.violated())
      if (contract.obligations.payment != null && contract.obligations.payment.violated()) {  
        //const seller = contract.obligations.payment.creditor;
        //const buyer = contract.obligations.payment.debtor;
        await ctx.stub.putState(contractId, Buffer.from(serialize(contract)))
        return {successful: true}
      } else {
        return {successful: false}
      }
    } else {
      return {successful: false}
    }
  }

  async expirePower_suspendDelivery(ctx, contractId) {
    const contractState = await ctx.stub.getState(contractId)
    if (contractState == null) {
      return {successful: false}
    }
    const contract = deserialize(contractState.toString())
    this.initialize(contract)
  
    if (contract.isInEffect()) {
      if (contract.powers.suspendDelivery != null && contract.powers.suspendDelivery.expired()) {      
        await ctx.stub.putState(contractId, Buffer.from(serialize(contract)))
        return {successful: true}
      } else {
        return {successful: false}
      }
    } else {
      return {successful: false}
    }
  }
  
  async expirePower_resumeDelivery(ctx, contractId) {
    const contractState = await ctx.stub.getState(contractId)
    if (contractState == null) {
      return {successful: false}
    }
    const contract = deserialize(contractState.toString())
    this.initialize(contract)
  
    if (contract.isInEffect()) {
      if (contract.powers.resumeDelivery != null && contract.powers.resumeDelivery.expired()) {      
        await ctx.stub.putState(contractId, Buffer.from(serialize(contract)))
        return {successful: true}
      } else {
        return {successful: false}
      }
    } else {
      return {successful: false}
    }
  }
  
  async expirePower_terminateContract(ctx, contractId) {
    const contractState = await ctx.stub.getState(contractId)
    if (contractState == null) {
      return {successful: false}
    }
    const contract = deserialize(contractState.toString())
    this.initialize(contract)
  
    if (contract.isInEffect()) {
      if (contract.powers.terminateContract != null && contract.powers.terminateContract.expired()) {      
        await ctx.stub.putState(contractId, Buffer.from(serialize(contract)))
        return {successful: true}
      } else {
        return {successful: false}
      }
    } else {
      return {successful: false}
    }
  }
  //Access control 
/*
  async trigger_makePerformerOf(ctx,args){
    const inputs = JSON.parse(args);
    // here if statment to check if a role is allowed to make a chnage 
    if(isOwner(inputs.seller)){
    //call a function from AC that set the performer 
    makePerformerOf(inputs.seller, obligation/power, performer)
    }
  }
*/

//addPerformer, deltePerforerm all types of events that are not part of the domain, we can name them
//access controll events
   
  //

  //AC -- access state, time for obligation and power 
  //getDeliveryDateAndTime if the delivery obligation part of another obligation or power
  // the role has permesstion to read only the state that is part of obligation or power. e.g., Happens(Violated(obligations.payment))
  async getLegalPositionStateAndTime(ctx, args) {
    const inputs = JSON.parse(args);
  	const contractId = inputs.contractId;
    ////////////console.log("contractId")
    ////////////console.log(contractId)
   
  	const quiredState = inputs.quiredState.state
    const requiredResource = inputs.quiredState.resource
    const requiredResourceType = inputs.quiredState.resourceType

    let output = {}

  	const contractState = await ctx.stub.getState(contractId)
  	if (contractState == null) {
  	  return {successful: false}
  	}

    const contract = deserialize(contractState.toString())
    this.initialize(contract)

    const aResource = contract.findLegalPosition(requiredResource, requiredResourceType, contract)
    
    ////////console.log("aResource before if")
    ////////console.log(aResource)

    if(aResource !== null){
      switch(requiredResourceType.toLowerCase()){
       case 'obligation':
        //console.log("aResource")
        //console.log(aResource)
        if(contract.accessPolicy.hasPermesstion('grant','read', aResource, contract.seller, contract.seller)) {
      //////////console.log(contract.obligations.delivery.state)

      //note: Obligation super state (inEffect, suspension)
      if (aResource.activeState.toLowerCase() === "suspension") {
        output = {
            state: aResource.activeState,
            time: aResource.getSuspendedTime()
        };
        return output
    } else {// ineffect does not have time cuz can be either resumed or activated 
        if(aResource.activeState.toLowerCase() === "ineffect"){
          switch(aResource.state.toLowerCase()){
            case 'active': output = {state: aResource.state, time: aResource.getActivitedTime()}
            break
            //case 'resume': output = {state: contract.obligations.delivery.state, time: contract.obligations.delivery.getResumedTime()}
            //break
          }

        //output = {state:contract.obligations.delivery.activeState, time: contract.obligations.delivery.getInEffectTime()}
        return output
        }
        
    }

      switch(aResource.state.toLowerCase()){
        //case 'active': output = {state: contract.obligations.delivery.state, time: contract.obligations.delivery.getActivitedTime()}
        //break
        case 'violation': output = {state: aResource.state, time: aResource.getViolatedTime()}
        break //for conditional obligation 
        case 'create': output = {state:aResource.state , time: aResource.getCreatedTime()}
        break
        case 'fulfillment':output = {state:aResource.isFulfilled()? "Fulfillment": "false", time: aResource.getFulfilledTime()}
        break
        case'unsuccessfultermination':output = {state:aResource.state, time: aResource.getUnsuccessfulterminationTime()}
        break //when obligation get expired
        case 'discharge':output = {state:aResource.state , time: aResource.getDischargedTime()}
        break
        default: throw new Error(`Please enter valid state..`)
          
    
      }


    }else{
      throw new Error(`access denied...`)
    }

      
    //}
    break
    case 'power':
    
      if(contract.accessPolicy.hasPermesstion('grant','read', aResource, contract.seller, contract.seller)) {
        //////////console.log(contract.obligations.delivery.state)
  
        //note: Obligation super state (inEffect, suspension)
        if (aResource.activeState.toLowerCase() === "suspension") {
          output = {
              state: aResource.activeState,
              time: aResource.getSuspendedTime()
          };
          return output
      } else {// ineffect does not have time cuz can be either resumed or activated 
          if(aResource.activeState.toLowerCase() === "ineffect"){
            switch(aResource.state.toLowerCase()){
              case 'active': output = {state: aResource.state, time: aResource.getActivitedTime()}
              break
              //case 'resume': output = {state: contract.obligations.delivery.state, time: contract.obligations.delivery.getResumedTime()}
              //break
            }
  
          //output = {state:contract.obligations.delivery.activeState, time: contract.obligations.delivery.getInEffectTime()}
          return output
          }
          
      }
  
        switch(aResource.state.toLowerCase()){
          case 'create': output = {state:aResource.state , time: aResource.getCreatedTime()}
          break
          case'unsuccessfultermination':output = {state:aResource.state, time: aResource.getUnsuccessfulterminationTime()}
          break //when obligation get expired
          case 'successfultermination':output = {state:aResource.state , time: aResource.getSuccessfulterminationTime()}
          break
          default: throw new Error(`Please enter valid state...`)

        }
  
  
      }else{
        throw new Error(`access denied...`)
      }
    }// outer switch
    }//if (aResource !== null)
  

    

    
  //}//first switch
    
  

    //////////console.log(output)

    return output
    //return {successful: true}
    
  }

  async getStateTimeOfParts(ctx, args){
 
    const inputs = JSON.parse(args);
    const contractId = inputs.contractId;
 
   
    //const quiredState = inputs.quiredState.state
    const requiredResource = inputs.condition
    //const requiredResourceType = inputs.quiredState.resourceType
 
    let output = {}
 
    const contractState = await ctx.stub.getState(contractId)
    if (contractState == null) {
      return {successful: false}
    }
 
    const contract = deserialize(contractState.toString())
    this.initialize(contract)
                                                              //aName, aType, aContrac
    const aLegalPositionIncodition = contract.findLegalPosition(requiredResource.resource, requiredResource.resourceType, contract)
 
     if(aLegalPositionIncodition !==null){
      //////console.log("requiredResource")
      //////console.log(requiredResource)
    switch(requiredResource._type.toLowerCase()){
       case 'statecondition':
          
           if(contract.accessPolicy.hasPermesstionOnLegalPosition('grant','read', requiredResource, contract.buyer, contract.seller,contract)){

            //////////console.log(contract.obligations.delivery.state)

      //note: Obligation super state (inEffect, suspension)
      if (aLegalPositionIncodition.activeState.toLowerCase() === "suspension" && requiredResource.state.toLowerCase() === "suspension") {
        output = {
            state: aLegalPositionIncodition.activeState,
            time: aLegalPositionIncodition.getSuspendedTime()
        };
        return output
    } else {// ineffect does not have time cuz can be either resumed or activated 
        if(aLegalPositionIncodition.activeState.toLowerCase() === "ineffect" && requiredResource.state.toLowerCase() === "ineffect"){
          switch(aLegalPositionIncodition.state.toLowerCase()){
            case 'active': output = {state: aLegalPositionIncodition.state, time: aLegalPositionIncodition.getActivitedTime()}
            break

          }
        return output
        }
        
    }

      switch(requiredResource.state.toLowerCase()){
        //case 'active': output = {state: contract.obligations.delivery.state, time: contract.obligations.delivery.getActivitedTime()}
        //break
        case 'violation': output = {state: aLegalPositionIncodition.state, time: aLegalPositionIncodition.getViolatedTime()}
        break //for conditional obligation 
        case 'create': output = {state:aLegalPositionIncodition.state , time: aLegalPositionIncodition.getCreatedTime()}
        break
        case 'fulfillment':output = {state:aLegalPositionIncodition.isFulfilled()? "Fulfillment": "false", time: aLegalPositionIncodition.getFulfilledTime()}
        break
        case'unsuccessfultermination':output = {state:aLegalPositionIncodition.state, time: aLegalPositionIncodition.getUnsuccessfulterminationTime()}
        break //when obligation get expired
        case 'discharge':output = {state:aLegalPositionIncodition.state , time: aLegalPositionIncodition.getDischargedTime()}
        break// below here is for power 
        case 'create': output = {state:aLegalPositionIncodition.state , time: aLegalPositionIncodition.getCreatedTime()}
        break //when obligation get expired
        case 'successfultermination':output = {state:aLegalPositionIncodition.state , time: aLegalPositionIncodition.getSuccessfulterminationTime()}
        break
        default: throw new Error(`Please enter valid state...`)
      }
     
    } else{
      throw new Error(`access denied...`)
    }
      break
      case 'condition': //requiredResource = condiiton
      if(contract.accessPolicy.hasPermesstionOnLegalPosition('grant','read', requiredResource, contract.seller, contract.seller,contract)){
        let conditionValue = eval('contract.'+requiredResource.leftSide + " " + requiredResource.op + " " + requiredResource.rightSide)
        output = {state: conditionValue, time: null}
      }else{
        throw new Error(`access denied...`)
      }
       break
      case 'eventcondition':
        //{_type: 'eventCondition', partResource:"delivered", partResourceType:"Delivered", resource:"delivery", resourceType:"obligation"}
        ////console.log("eventObjkkkk")
        if(contract.accessPolicy.hasPermesstionOnLegalPosition('grant','read', requiredResource, contract.seller, contract.seller,contract)){
          let eventObj = contract.findObject(requiredResource.partResource, requiredResource.partResourceType, contract)
          ////console.log("eventObj")
          ////console.log(eventObj)
          output = {time: eventObj.getHappenedTime(), state: eventObj.hasHappened()  ? "Happened" : "Not Happened"}
        }else{
          throw new Error(`access denied...`)
        }
        break
        default: throw new Error(`This is not a valid part of legal situation...`)
    }
}
 
    return output 
 
}


  

  //AC
  //AC 
  //getDeliveryDateAndTime if the delivery obligation part of another obligation or power
  async getDeliveredDateAndTime(ctx, args) {
    const inputs = JSON.parse(args);
  	const contractId = inputs.contractId;
    ////////////console.log("contractId")
    ////////////console.log(contractId)
  	const quiredState = inputs.quiredState.state;

    let output = {}

  	const contractState = await ctx.stub.getState(contractId)
  	if (contractState == null) {
  	  return {successful: false}
  	}

    const contract = deserialize(contractState.toString())
    this.initialize(contract)

    ////////////console.log("quiredState2nd function")
    ////////////console.log(quiredState)
    //hasPermission()
    ////console.log("contract.seller")
    ////console.log(contract.seller)
    ////console.log("contract.delivered")
    ////console.log(contract.delivered)
    if(contract.accessPolicy.hasPermesstion('grant','read', contract.delivered, contract.shipper, contract.shipper) || contract.accessPolicy.hasPermesstionOnLegalPosition('grant','read', contract.delivered, contract.seller, contract.seller,contract)){
      //////////console.log("he has")
      output = {time: contract.delivered.getHappenedTime(), state: contract.delivered.hasHappened()  ? "Happened" : "Not Happened"}
      ////////////console.log(output)

  
    }else{
      //////////console.log("he has not")
    }
    return output
    //return {successful: true}
  }

  async getPaidDateAndTime(ctx, args) {
    const inputs = JSON.parse(args);
  	const contractId = inputs.contractId;
    ////////////console.log("contractId")
    ////////////console.log(contractId)
  	const quiredState = inputs.quiredState.state;

    let output = {}

  	const contractState = await ctx.stub.getState(contractId)
  	if (contractState == null) {
  	  return {successful: false}
  	}

    const contract = deserialize(contractState.toString())
    this.initialize(contract)

    ////////////console.log("quiredState2nd function")
    ////////////console.log(quiredState)
    //hasPermission()
    if(contract.accessPolicy.hasPermesstion('grant','read', contract.paid, contract.buyer, contract.buyer) || contract.accessPolicy.hasPermesstionOnLegalPosition('grant','read', contract.delivered, contract.buyer, contract.buyer,contract)){
      //////////console.log("he has")
      output = {time: contract.paid.getHappenedTime(), state: contract.paid.hasHappened()  ? "Happened" : "Not Happened"}
      ////////////console.log(output)

  
    }else{
      //////////console.log("he has not")
    }
    return output
    //return {successful: true}
  }


  async getState(ctx, contractId) {
  	const contractState = await ctx.stub.getState(contractId)
  	if (contractState == null) {
  	  return {successful: false}
  	}
  	const contract = deserialize(contractState.toString())
  	this.initialize(contract)
  	let output = `Contract state: ${contract.state}-${contract.activeState}\r\n`
  	output += 'Obligations:\r\n'
  	for (const obligationKey of Object.keys(contract.obligations)) {
      output += `  ${obligationKey}: ${contract.obligations[obligationKey].state}-${contract.obligations[obligationKey].activeState}\r\n`
      ////////////console.log("I am in getState method" + output)
    }
    output += 'Powers:\r\n'
    for (const powerKey of Object.keys(contract.powers)) {
      output += `  ${powerKey}: ${contract.powers[powerKey].state}-${contract.powers[powerKey].activeState}\r\n`
    }
    output += 'Surviving Obligations:\r\n'
    for (const obligationKey of Object.keys(contract.survivingObligations)) {
      output += `  ${obligationKey}: ${contract.survivingObligations[obligationKey].state}-${contract.survivingObligations[obligationKey].activeState}\r\n`
    }
    output += 'Events:\r\n'
    if (contract.delivered._triggered) {
      output += `  Event "delivered" happened at ${contract.delivered._timestamp}\r\n`
    } else {
      output += `  Event "delivered" has not happened\r\n`
    }
    if (contract.paidLate._triggered) {
      output += `  Event "paidLate" happened at ${contract.paidLate._timestamp}\r\n`
    } else {
      output += `  Event "paidLate" has not happened\r\n`
    }
    if (contract.paid._triggered) {
      output += `  Event "paid" happened at ${contract.paid._timestamp}\r\n`
    } else {
      output += `  Event "paid" has not happened\r\n`
    }
    if (contract.disclosed._triggered) {
      output += `  Event "disclosed" happened at ${contract.disclosed._timestamp}\r\n`
    } else {
      output += `  Event "disclosed" has not happened\r\n`
    }
    return output
  }
}

module.exports.contracts = [HFContract];
