const { Contract } = require("fabric-contract-api")
const { MeatSale } = require("./domain/contract/MeatSale.js")
const { deserialize, serialize } = require("./serializer.js")
const { Events } = require("symboleoac-js-core")
const { InternalEvent, InternalEventSource, InternalEventType } = require("symboleoac-js-core")
const { getEventMap, EventListeners } = require("./events.js")
const { Rule } = require("symboleoac-js-core")
const { error } = require("fabric-shim")
//** 
const { ClientIdentity, ChaincodeStub }= require('fabric-shim');
const crypto = require('crypto');


class HFContract extends Contract {
  
  constructor() {
    super('MeatSale');
     //method 2
     this.userList = [];
  }

  initialize(contract) {
    Events.init(getEventMap(contract), EventListeners)
  }


    /**
   * Stores the hardcoded rolesList in the ledger as ACPolicyRecord with a signed hash.
   * Can only be called by Regulator or Admin.
   * Input is not accepted to prevent tampering.
   */
  async storeRolesPolicy(ctx, contractId, signature, publicKeyPem) {
    console.log("I am in storeRolesPolicy")
    
    let roleObj;
    const contractState = await ctx.stub.getState(contractId)
    if (contractState == null) {
      return {successful: false}
    }
    const contract = deserialize(contractState.toString())
    this.initialize(contract)

    //
    const cid = new ClientIdentity(ctx.stub);
    const userId = cid.getID();
    const role = cid.getAttributeValue('HF.role');
    
    console.log("Attr name")
    console.log(cid.getAttributeValue('HF.role'), cid.getAttributeValue('HF.name'), 
        cid.getAttributeValue('organization'), cid.getAttributeValue('department'))

    try{
      if (role !== 'Admin' && role !== 'Regulator') {

      throw new Error('Only Admin or Regulator can trigger roles policy storage');
     }else{
        roleObj = contract.authenticate(cid.getAttributeValue('HF.role'), cid.getAttributeValue('HF.name'), 
        cid.getAttributeValue('organization'), cid.getAttributeValue('department'),contract)

             if(roleObj === null ){ 
              throw new Error('Unauthorized: Unknown access'); 

        }
     }//else
     }catch(err){
        console.log('access control error: ', err)
        return { successful: false, message: err.message }
       }// end of first layer

    // Build roles policy from hardcoded list in contract spec
    const policy = {
      roles: contract._roles.map(role => ({
        name: role._name,
        type: role._type,
        dept: role.dept._value,
        org: role.org._value
      })),
      metadata: {
        storedBy: cid.getID(),
        timestamp: new Date().toISOString()
      }
    };

    const policyStr = JSON.stringify(policy);
    const policyHash = crypto.createHash('sha256').update(policyStr).digest();

    // Verify digital signature provided by API
    const verifier = crypto.createVerify('SHA256');
    verifier.update(policyStr);
    verifier.end();

    const isVerified = verifier.verify(publicKeyPem, signature, 'base64');
    if (!isVerified) {
      throw new Error('Signature verification failed. ACPolicy not stored.');
    }

    const record = {
      hash: policyHash.toString('hex'),
      policy,
      signature,
      verified: true,
      signer: userId
    };

    await ctx.stub.putState('ACPolicyRecord', Buffer.from(JSON.stringify(record)));

    // Emit tamper-proof event
    await ctx.stub.setEvent('ACPolicyStored', Buffer.from(JSON.stringify({
      accessor: userId,
      role,
      hash: policyHash.toString('hex'),
      time: new Date().toISOString()
    })));

    return {
      successful: true,
      hash: policyHash.toString('hex'),
      message: 'ACPolicy stored successfully with verified signature'
    };
  }

  /**
   * Allows CAAdmin or Regulator to retrieve the stored ACPolicy.
   */
  async getRolePolicy(ctx, contractId) {
   
    let roleObj;
    const contractState = await ctx.stub.getState(contractId)
    if (contractState == null) {
      return {successful: false}
    }
    const contract = deserialize(contractState.toString())
    this.initialize(contract)

    //
    const cid = new ClientIdentity(ctx.stub);
    const userId = cid.getID();
    const role = cid.getAttributeValue('HF.role');
    
    console.log("Attr name")
    console.log(cid.getAttributeValue('HF.role'), cid.getAttributeValue('HF.name'), 
        cid.getAttributeValue('organization'), cid.getAttributeValue('department'))

    try{
      if (role !== 'Admin' && role !== 'Regulator') {

      throw new Error('Only Admin or Regulator can trigger roles policy storage');
     }else{
        roleObj = contract.authenticate(cid.getAttributeValue('HF.role'), cid.getAttributeValue('HF.name'), 
        cid.getAttributeValue('organization'), cid.getAttributeValue('department'),contract)

             if(roleObj === null ){ 
              throw new Error('Unauthorized: Unknown access'); 

        }
     }//else
     }catch(err){
        console.log('access control error: ', err)
        return { successful: false, message: err.message }
       }// end of first layer

    const policyBytes = await ctx.stub.getState('ACPolicyRecord');
    if (!policyBytes || policyBytes.length === 0) {
      return { successful: false, message: 'ACPolicyRecord not found' };
    }

    const policy = JSON.parse(policyBytes.toString());

    // Emit access event for auditing
    await ctx.stub.setEvent('ACPolicyAccessed', Buffer.from(JSON.stringify({
      accessor: userId,
      role,
      time: new Date().toISOString()
    })));

    return {
      successful: true,
      message: 'ACPolicy retrieved successfully',
      policyRecord: policy
    };
  }


  async init(ctx, args) {
    console.log("I am in init")
  	const inputs = JSON.parse(args);
    console.log("I am in init before meatsale")
    const contractInstance = new MeatSale (inputs.buyerP, inputs.sellerP, inputs.transportCoP, inputs.assessorP, inputs.regulatorP, inputs.storageP, inputs.shipperP, inputs.adminP, inputs.barcodeP, inputs.qnt, inputs.qlt, inputs.amt, inputs.curr, inputs.payDueDate, inputs.delAdd, inputs.effDate, inputs.delDueDateDays, inputs.interestRate)
    console.log("I am in init after meatsale")
    this.initialize(contractInstance)
    console.log("I am in init after initilize")
    if (contractInstance.activated()) {
      // call trigger transitions for legal positions
      contractInstance.obligations.delivery.trigerredUnconditional()
      contractInstance.obligations.payment.trigerredConditional()
  
      await ctx.stub.putState(contractInstance.id, Buffer.from(serialize(contractInstance)))
  
      return {successful: true, contractId: contractInstance.id}
    } else {
      return {successful: false}
    }
  }

  async trigger_delivered(ctx, args) {
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
    	if(!contract.accessPolicy.hasPermesstion('grant','read', contract.delivered, contract.shipper, contract.shipper) || 
    	      !contract.accessPolicy.isValid(new Rule('grant','read', contract.delivered, contract.shipper, contract.shipper)) ){
    	        throw new Error(`access denied...`)
    	      }
      contract.delivered.happen(event)
      Events.emitEvent(contract, new InternalEvent(InternalEventSource.contractEvent, InternalEventType.contractEvent.Happened, contract.delivered))
      await ctx.stub.putState(contractId, Buffer.from(serialize(contract)))
      return {successful: true}
    } else {
      return {successful: false}
    }
  }
  
  async trigger_paidLate(ctx, args) {
    //** 
    const cid = new ClientIdentity(ctx.stub);

    try{
      const userId = cid.getID();
      const enrollmentId = userId.match(/CN=([^:]+)::/)[1]; // like user1, user2, seller1, seller2, buyer1
      // role base access or certificate base access
      if(userId === `x509::/OU=client/OU=org1/OU=department1/CN=${enrollmentId}::/C=US/ST=North Carolina/L=Durham/O=org1.example.com/CN=ca.org1.example.com`){
          console.log(`${enrollmentId} allow to access the chaincode function`)
      }else{
        return {successful: false, message: `${enrollmentId} does not have access to trigger_paidLate function`}
      }
     
      if(cid.assertAttributeValue('HF.role', 'party1_seller')){
          console.log(`${enrollmentId} have party1_seller hf.role`)
      }else{
        return {successful: false,message: `${enrollmentId} does not have party1_buyer hf.role`}
      }
    }catch(err){
        console.log('access control error: ', err)
    }
    //
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
    	if(!contract.accessPolicy.hasPermesstion('grant','read', contract.paidLate, contract.shipper, contract.shipper) || 
    	      !contract.accessPolicy.isValid(new Rule('grant','read', contract.paidLate, contract.shipper, contract.shipper)) ){
    	        throw new Error(`access denied...`)
    	      }
      contract.paidLate.happen(event)
      Events.emitEvent(contract, new InternalEvent(InternalEventSource.contractEvent, InternalEventType.contractEvent.Happened, contract.paidLate))
      await ctx.stub.putState(contractId, Buffer.from(serialize(contract)))
      const asset = {
        contractId: contractId,
        event: event,
        message: 'The late payment has been Paid successfully'
      };
      const assetBuffer = Buffer.from(JSON.stringify(asset));
      ///it will be triggred by notificatipn function
      ctx.stub.setEvent('Notified: triggerPaidLate', assetBuffer);
      return {successful: true}
    } else {
      return {successful: false}
    }
  }
  
  async trigger_paid(ctx, args) {
    const cid = new ClientIdentity(ctx.stub);
    let roleObj;

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
     
    try{
      //const userId = cid.getID();

       roleObj = contract.authenticate(cid.getAttributeValue('HF.role'), cid.getAttributeValue('HF.name'), 
       cid.getAttributeValue('organization'), cid.getAttributeValue('department'),contract)

             if(roleObj === null ){ // this mean the roleObj (role who calls the transaction) exist in our conttract
              throw new Error('Unauthorized: Unknown access'); 
         //roleObj: we do not have a role that has the same name and type that calls the transaction like e.g., there is no shipper
        // wrong certificate
        }

    }catch(err){
        console.log('access control error: ', err)
        return { successful: false, message: err.message }
    }// end of first layer
    //seond layer 
  	
        let controllers = contract.paid._controller
    	if(!contract.accessPolicy.hasPermesstion('grant','read', contract.paid, roleObj, contract.paid.getController(controllers.length - 1)) || 
    	      !contract.accessPolicy.isValid(new Rule('grant','read', contract.paid, roleObj, contract.paid.getController(controllers.length - 1))) ){
    	        throw new Error(`access denied...`)
    	      }
      contract.paid.happen(event)
      Events.emitEvent(contract, new InternalEvent(InternalEventSource.contractEvent, InternalEventType.contractEvent.Happened, contract.paid))
      //Notification
      ctx.stub.setEvent('Notified: triggerPaid', Buffer.from(serialize(contract)));
      await ctx.stub.putState(contractId, Buffer.from(serialize(contract)))
      return {successful: true}
       
    } else {
      return {successful: false}
    }

  }
  
  async trigger_passwordNotification(ctx, args) {
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
    	if(!contract.accessPolicy.hasPermesstion('grant','read', contract.passwordNotification, contract.shipper, contract.shipper) || 
    	      !contract.accessPolicy.isValid(new Rule('grant','read', contract.passwordNotification, contract.shipper, contract.shipper)) ){
    	        throw new Error(`access denied...`)
    	      }
      contract.passwordNotification.happen(event)
      Events.emitEvent(contract, new InternalEvent(InternalEventSource.contractEvent, InternalEventType.contractEvent.Happened, contract.passwordNotification))
      await ctx.stub.putState(contractId, Buffer.from(serialize(contract)))
      return {successful: true}
    } else {
      return {successful: false}
    }
  }
  
  async trigger_inspectedQuality(ctx, args) {
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
    	if(!contract.accessPolicy.hasPermesstion('grant','read', contract.inspectedQuality, contract.shipper, contract.shipper) || 
    	      !contract.accessPolicy.isValid(new Rule('grant','read', contract.inspectedQuality, contract.shipper, contract.shipper)) ){
    	        throw new Error(`access denied...`)
    	      }
      contract.inspectedQuality.happen(event)
      Events.emitEvent(contract, new InternalEvent(InternalEventSource.contractEvent, InternalEventType.contractEvent.Happened, contract.inspectedQuality))
      await ctx.stub.putState(contractId, Buffer.from(serialize(contract)))
      return {successful: true}
    } else {
      return {successful: false}
    }
  }
  
  async trigger_unLoaded(ctx, args) {
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
    	if(!contract.accessPolicy.hasPermesstion('grant','read', contract.unLoaded, contract.shipper, contract.shipper) || 
    	      !contract.accessPolicy.isValid(new Rule('grant','read', contract.unLoaded, contract.shipper, contract.shipper)) ){
    	        throw new Error(`access denied...`)
    	      }
      contract.unLoaded.happen(event)
      Events.emitEvent(contract, new InternalEvent(InternalEventSource.contractEvent, InternalEventType.contractEvent.Happened, contract.unLoaded))
      await ctx.stub.putState(contractId, Buffer.from(serialize(contract)))
      return {successful: true}
    } else {
      return {successful: false}
    }
  }
  
  async p_suspendDelivery_suspended_o_delivery(ctx, contractId) {
    const contractState = await ctx.stub.getState(contractId)
    if (contractState == null) {
      return {successful: false}
    }
    const contract = deserialize(contractState.toString())
    this.initialize(contract)
    if (contract.isInEffect() && contract.powers.suspendDelivery != null && contract.powers.suspendDelivery.isInEffect()) {
      if(!contract.accessPolicy.hasPermesstion('grant','read', contract.powers.suspendDelivery, contract.buyer, contract.buyer) || 
                !contract.accessPolicy.isValid(new Rule('grant','read', contract.powers.suspendDelivery, contract.buyer, contract.buyer)) ){
                  throw new Error(`access denied...`)
                }
      const obligation = contract.obligations.delivery
      if (obligation != null && obligation.suspended() && contract.powers.suspendDelivery.exerted()) {
        await ctx.stub.putState(contractId, Buffer.from(serialize(contract)))
        return {successful: true}
      } else {
        return {successful: false}
      }
    } else {
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
      if(!contract.accessPolicy.hasPermesstion('grant','read', contract.powers.resumeDelivery, contract.buyer, contract.buyer) || 
                !contract.accessPolicy.isValid(new Rule('grant','read', contract.powers.resumeDelivery, contract.buyer, contract.buyer)) ){
                  throw new Error(`access denied...`)
                }
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
    	if(!contract.accessPolicy.hasPermesstion('grant','read', contract.powers.terminateContract, contract.buyer, contract.buyer) || 
    	          !contract.accessPolicy.isValid(new Rule('grant','read', contract.powers.terminateContract, contract.buyer, contract.buyer)) ){
    	            throw new Error(`access denied...`)
    	          }
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
  
  async violateObligation_inspectMeat(ctx, contractId) {
    const contractState = await ctx.stub.getState(contractId)
    if (contractState == null) {
      return {successful: false}
    }
    const contract = deserialize(contractState.toString())
    this.initialize(contract)
  
    if (contract.isInEffect()) {
      if (contract.obligations.inspectMeat != null){
      	if(!contract.accessPolicy.hasPermesstion('grant','read', contract.obligations.inspectMeat, contract.buyer, contract.buyer) || 
      	      !contract.accessPolicy.isValid(new Rule('grant','read', contract.obligations.inspectMeat, contract.buyer, contract.buyer)) ){
      	        throw new Error(`access denied...`)
      	      }
      	if (contract.obligations.inspectMeat.violated()) {      
        		await ctx.stub.putState(contractId, Buffer.from(serialize(contract)))
        		return {successful: true}
      	} else {
        		return {successful: false}
      	}
      }else {
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
      if (contract.obligations.latePayment != null){
      	if(!contract.accessPolicy.hasPermesstion('grant','read', contract.obligations.latePayment, contract.buyer, contract.buyer) || 
      	      !contract.accessPolicy.isValid(new Rule('grant','read', contract.obligations.latePayment, contract.buyer, contract.buyer)) ){
      	        throw new Error(`access denied...`)
      	      }
      	if (contract.obligations.latePayment.violated()) {      
        		await ctx.stub.putState(contractId, Buffer.from(serialize(contract)))
        		return {successful: true}
      	} else {
        		return {successful: false}
      	}
      }else {
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
      if (contract.obligations.delivery != null){
      	if(!contract.accessPolicy.hasPermesstion('grant','read', contract.obligations.delivery, contract.buyer, contract.buyer) || 
      	      !contract.accessPolicy.isValid(new Rule('grant','read', contract.obligations.delivery, contract.buyer, contract.buyer)) ){
      	        throw new Error(`access denied...`)
      	      }
      	if (contract.obligations.delivery.violated()) {      
        		await ctx.stub.putState(contractId, Buffer.from(serialize(contract)))
        		return {successful: true}
      	} else {
        		return {successful: false}
      	}
      }else {
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
      if (contract.obligations.payment != null){
      	if(!contract.accessPolicy.hasPermesstion('grant','read', contract.obligations.payment, contract.buyer, contract.buyer) || 
      	      !contract.accessPolicy.isValid(new Rule('grant','read', contract.obligations.payment, contract.buyer, contract.buyer)) ){
      	        throw new Error(`access denied...`)
      	      }
      	if (contract.obligations.payment.violated()) {      
        		await ctx.stub.putState(contractId, Buffer.from(serialize(contract)))
        		return {successful: true}
      	} else {
        		return {successful: false}
      	}
      }else {
                  return {successful: false}
                }
    } else {
      return {successful: false}
    }
  }
  
  async expireObligation_inspectMeat(ctx, contractId) {
    const contractState = await ctx.stub.getState(contractId)
    if (contractState == null) {
      return {successful: false}
    }
    const contract = deserialize(contractState.toString())
    this.initialize(contract)
  
    if (contract.isInEffect()) {
      if (contract.obligations.inspectMeat != null){
      	if(!contract.accessPolicy.hasPermesstion('grant','read', contract.obligations.inspectMeat, contract.buyer, contract.buyer) || 
      	    !contract.accessPolicy.isValid(new Rule('grant','read', contract.obligations.inspectMeat, contract.buyer, contract.buyer)) ){
      	          throw new Error(`access denied...`)
      	    }
      	if (contract.obligations.inspectMeat.expired()) {      
       		 await ctx.stub.putState(contractId, Buffer.from(serialize(contract)))
        		 return {successful: true}
      	} else {
        		return {successful: false}
     		 }
     } else {
       		return {successful: false}
              }		 
    } else {
      return {successful: false}
    }
  }
  
  async expireObligation_payment(ctx, contractId) {
    const contractState = await ctx.stub.getState(contractId)
    if (contractState == null) {
      return {successful: false}
    }
    const contract = deserialize(contractState.toString())
    this.initialize(contract)
  
    if (contract.isInEffect()) {
      if (contract.obligations.payment != null){
      	if(!contract.accessPolicy.hasPermesstion('grant','read', contract.obligations.payment, contract.buyer, contract.buyer) || 
      	    !contract.accessPolicy.isValid(new Rule('grant','read', contract.obligations.payment, contract.buyer, contract.buyer)) ){
      	          throw new Error(`access denied...`)
      	    }
      	if (contract.obligations.payment.expired()) {      
       		 await ctx.stub.putState(contractId, Buffer.from(serialize(contract)))
        		 return {successful: true}
      	} else {
        		return {successful: false}
     		 }
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
      if (contract.powers.suspendDelivery != null){
      	if(!contract.accessPolicy.hasPermesstion('grant','read', contract.powers.suspendDelivery, contract.buyer, contract.buyer) || 
      	    !contract.accessPolicy.isValid(new Rule('grant','read', contract.powers.suspendDelivery, contract.buyer, contract.buyer)) ){
      	           throw new Error(`access denied...`)
      	    } 
      if (contract.powers.suspendDelivery.expired()) {      
        await ctx.stub.putState(contractId, Buffer.from(serialize(contract)))
        return {successful: true}
      } else {
        return {successful: false}
      }
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
      if (contract.powers.resumeDelivery != null){
      	if(!contract.accessPolicy.hasPermesstion('grant','read', contract.powers.resumeDelivery, contract.buyer, contract.buyer) || 
      	    !contract.accessPolicy.isValid(new Rule('grant','read', contract.powers.resumeDelivery, contract.buyer, contract.buyer)) ){
      	           throw new Error(`access denied...`)
      	    } 
      if (contract.powers.resumeDelivery.expired()) {      
        await ctx.stub.putState(contractId, Buffer.from(serialize(contract)))
        return {successful: true}
      } else {
        return {successful: false}
      }
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
      if (contract.powers.terminateContract != null){
      	if(!contract.accessPolicy.hasPermesstion('grant','read', contract.powers.terminateContract, contract.buyer, contract.buyer) || 
      	    !contract.accessPolicy.isValid(new Rule('grant','read', contract.powers.terminateContract, contract.buyer, contract.buyer)) ){
      	           throw new Error(`access denied...`)
      	    } 
      if (contract.powers.terminateContract.expired()) {      
        await ctx.stub.putState(contractId, Buffer.from(serialize(contract)))
        return {successful: true}
      } else {
        return {successful: false}
      }
      } else {
                    return {successful: false}
                  }
    } else {
      return {successful: false}
    }
  }
  
  
  //get Date And Time of any event
  async getEventDateAndTime(ctx, args) {
      const inputs = JSON.parse(args);
      const contractId = inputs.contractId;
      const requiredResource = inputs.event
      let output = {}
      const contractState = await ctx.stub.getState(contractId)
      if (contractState == null) {
        return {successful: false}
      }
      const contract = deserialize(contractState.toString())
      this.initialize(contract)
      let eventObj = contract.findObject(requiredResource.event, requiredResource._type, contract)
      if (  eventObj != null){
      if(contract.accessPolicy.hasPermesstion('grant','read', eventObj, contract.shipper, contract.shipper) || contract.accessPolicy.hasPermesstionOnLegalPosition('grant','read', eventObj, contract.seller, contract.seller,contract)){
        output = {time: eventObj.getHappenedTime(), state: eventObj.hasHappened()  ? "Happened" : "Not Happened"}  
      }else{
        throw new Error(`access denied...`)
      }
      return output
      }else{ throw new Error(`The event is not exist...`)}
    }

  //AC -- access state, time for legalpositions (obligation and power) by authorized roles 
  async getLegalPositionStateAndTime(ctx, args) {
    const inputs = JSON.parse(args);
    const contractId = inputs.contractId;
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
    if(aResource !== null){
      switch(requiredResourceType.toLowerCase()){
       case 'obligation':
         if(contract.accessPolicy.hasPermesstion('grant','read', aResource, contract.seller, contract.seller)) {
             output= contract.findStateTimeLegalPosition(aResource)
    }else{
      throw new Error(`access denied...`)
    }
    break
    case 'power': 
      if(contract.accessPolicy.hasPermesstion('grant','read', aResource, contract.seller, contract.seller)) {
           output=contract.findStateTimeLegalPosition(aResource)
      }else{
        throw new Error(`access denied...`)
      }
    }// outer switch
    } else{throw new Error(`Resource is not exist...`)}//if (aResource == null)
  
    return output
    
  }
  
  // Access the state and time of the parts of the legalpositions
  async getStateTimeOfParts(ctx, args){
   const inputs = JSON.parse(args);
   const contractId = inputs.contractId;
   const requiredResource = inputs.condition
  
   let output = {}
  
   const contractState = await ctx.stub.getState(contractId)
   if (contractState == null) {
     return {successful: false}
   }
  
   const contract = deserialize(contractState.toString())
   this.initialize(contract)
   const aLegalPositionIncodition = contract.findLegalPosition(requiredResource.resource, requiredResource.resourceType, contract)
   if(aLegalPositionIncodition !==null){
      switch(requiredResource._type.toLowerCase()){
        case 'statecondition':          
          if(contract.accessPolicy.hasPermesstionOnLegalPosition('grant','read', requiredResource, contract.buyer, contract.seller,contract)){
            output=contract.findStateTimeLegalPosition(aLegalPositionIncodition)
             if(output.State !== null && output.State !== undefined ){
               if (output.State.toLowerCase() !== requiredResource.state.toLowerCase() ) {
                    output = {state: requiredResource.state.toLowerCase()+' is Not Happened', time: null}
                 }
               }
          } else{
              throw new Error(`access denied...`)
          }
        break
        
        case 'condition': 
          if(contract.accessPolicy.hasPermesstionOnLegalPosition('grant','read', requiredResource, contract.seller, contract.seller,contract)){
            let conditionValue = eval('contract.'+requiredResource.leftSide + " " + requiredResource.op + " " + requiredResource.rightSide)
            output = {state: conditionValue, time: null}
          }else{
                throw new Error(`access denied...`)
          }
        break
      
        case 'eventcondition':
          if(contract.accessPolicy.hasPermesstionOnLegalPosition('grant','read', requiredResource, contract.seller, contract.seller,contract)){
             let eventObj = contract.findObject(requiredResource.partResource, requiredResource.partResourceType, contract)
             output = {time: eventObj.getHappenedTime(), state: eventObj.hasHappened()  ? "Happened" : "Not Happened"}
          }else{
               throw new Error(`access denied...`)
          }
        break
        
        default: throw new Error(`This is not a valid part of legal situation...`)
      }
      
   }else {throw new Error(`Resource is not exist...`)}
  
   return output
  
  }
  
 // Return the states of the contract and its parts     
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
    if (contract.passwordNotification._triggered) {
      output += `  Event "passwordNotification" happened at ${contract.passwordNotification._timestamp}\r\n`
    } else {
      output += `  Event "passwordNotification" has not happened\r\n`
    }
    if (contract.inspectedQuality._triggered) {
      output += `  Event "inspectedQuality" happened at ${contract.inspectedQuality._timestamp}\r\n`
    } else {
      output += `  Event "inspectedQuality" has not happened\r\n`
    }
    if (contract.unLoaded._triggered) {
      output += `  Event "unLoaded" happened at ${contract.unLoaded._timestamp}\r\n`
    } else {
      output += `  Event "unLoaded" has not happened\r\n`
    }
    
    return output
  }
}

module.exports.contracts = [HFContract];
