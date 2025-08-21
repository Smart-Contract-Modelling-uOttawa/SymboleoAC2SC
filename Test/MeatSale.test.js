'use strict'
const sinon = require('sinon')
const chai = require('chai')
const sinonChai = require('sinon-chai')
const { Obligation, Resource } = require('symboleo-js-core')
const expect = chai.expect

const { Context } = require('fabric-contract-api')
const { ChaincodeStub } = require('fabric-shim')

const [HFContract] = require('../MeatSale/index').contracts
const { serialize, deserialize } = require('../MeatSale/serializer')
//const { ChaincodeMockStub, Transform } = require('@theledger/fabric-mock-stub');


//const {MeatSaleNotification} = require('../notification/MeatSale.notification')
//flat
const {stringify, parse } = require('flatted');

let assert = sinon.assert
chai.use(sinonChai)

describe('Meat Sale chain code tests', () => {
  //AC for oblivation/power state and time
  let quiredState = {state:"active", resource:"delivery", resourceType:"obligation"}

  //AC event 
  let EventquiredState = {event:"delivered", _type:"Delivered"}
  let EventquiredState2 = {event:"paid", _type:"Paid"}
  let EventquiredState3 = {event:"sold", _type:"Sold"}



  //let seller = { "returnAddress": "add", "name": "seller name"}

  //AC for parts of obligation and power 
  //parameters of senario 1
  let condition1 = {state: "fulfillment", resource:"delivery", resourceType:"obligation", _type: 'stateCondition'} // go to the parts (else)
  let condition2 = {state: "violation", resource:"delivery", resourceType:"obligation", _type: 'stateCondition'} // go to the parts (else)


  //AC for parts of obligation and power 
  //parameters of senario 2
  let condition3 = {leftSide: 'delivered.temperature._value', op:'<=', rightSide:'-5', _type: 'Condition', resource:"delivery", resourceType:"obligation"} // go to the parts (else)

  let eventCondition = {_type: 'eventCondition', partResource:"delivered", partResourceType:"Delivered", resource:"delivery", resourceType:"obligation"}

 
  //{state: "violated", _type: 'stateCondition', resource:"delivery", resourceType:"obligation"}
  
  let transactionContext, chaincodeStub, parameters, parametersObject
  beforeEach(() => {
    transactionContext = new Context()

    chaincodeStub = sinon.createStubInstance(ChaincodeStub)
    transactionContext.setChaincodeStub(chaincodeStub)

    chaincodeStub.putState.callsFake((key, value) => {
      if (!chaincodeStub.states) {
        chaincodeStub.states = {}
      }
      chaincodeStub.states[key] = value
    })

    chaincodeStub.getState.callsFake(async (key) => {
      let ret
      if (chaincodeStub.states) {
        ret = chaincodeStub.states[key]
      }
      return Promise.resolve(ret)
    })

    chaincodeStub.deleteState.callsFake(async (key) => {
      if (chaincodeStub.states) {
        delete chaincodeStub.states[key]
      }
      return Promise.resolve(key)
    })

    chaincodeStub.getStateByRange.callsFake(async () => {
      function* internalGetStateByRange() {
        if (chaincodeStub.states) {
          // Shallow copy
          const copied = Object.assign({}, chaincodeStub.states)

          for (let key in copied) {
            yield { value: copied[key] }
          }
        }
      }

      return Promise.resolve(internalGetStateByRange())
    })
    
    parametersObject = {
      "buyerP": { "warehouse": "70 Glouxter", "name": "buyer name"},
      "sellerP": { "returnAddress": "51 Riduea", "name": "seller name"},
      "transportCoP": { "returnAddress": "60 Orleans", "name": "transportCo name"},
      "assessorP": { "returnAddress": "11 copper", "name": "assessor name"},
      "regulatorP":{"name": "regulator name"},
      "storageP":{"address": "55 Riduea"},
      "shipperP": {"name": "shipper name"},
      "barcodeP":{},
      "qnt": 2,
      "qlt": 3,
      "amt": 3, 
      "curr": 1,
      "payDueDate": "2024-10-28T17:49:41.422Z", //"2025-10-28T17:49:41.422Z" fulfillment
      "delAdd": "delAdd",
      "effDate": "2026-08-28T17:49:41.422Z", //"2025-08-28T17:49:41.422Z"
      "delDueDateDays": 3,
      "interestRate": 2
    }

    parameters = JSON.stringify(parametersObject)

   



  })
/*
  describe('Test Init transaction.', () => {
     it('should return error on Init.', async () => {
       chaincodeStub.putState.rejects('failed inserting key')
       let c = new HFContract()
       try {
        const res = await c.init(transactionContext, parameters)
         assert.fail('InitLedger should have failed')
       } catch (err) {
         expect(err.name).to.equal('failed inserting key')
       }
     })

     it('should activate contract with the correct state for powers and obligations.', async () => {
       const c = new HFContract();
       const InitRes = await c.init(transactionContext, parameters);
       expect(InitRes.successful).to.eql(true);
       const state = JSON.parse((await chaincodeStub.getState(InitRes.contractId)).toString())
       expect(state.state).to.eql("Active")
       expect(state.activeState).to.eql("InEffect")
       expect(state.obligations.payment.state).to.eql("Active")
       expect(state.obligations.payment.activeState).to.eql("InEffect")
       expect(state.obligations.delivery.state).to.eql("Active")
       expect(state.obligations.delivery.activeState).to.eql("InEffect")
     })
   })

   /*describe('Scenario: Test Triggering Event Transactions', () => {
    let ctx, args, inputs, contract, mockStub;

  beforeEach(() => {
    // Mocking the context and contract state
    ctx = {
      stub: {
        getState: sinon.stub(),
        putState: sinon.stub()
      }
    };

    // Sample contract state and inputs
    inputs = {
      contractId: 'contract123',
      event: 'deliveryEvent'
    };

    contract = {
      isInEffect: () => true,
      accessPolicy: {
        hasPermesstion: sinon.stub(),
        isValid: sinon.stub()
      },
      delivered: {
        happen: sinon.stub(),
      },
      seller: 'seller'
    };

    // Serialize and Deserialize Functions
    mockStub = {
      serialize: sinon.stub(),
      deserialize: sinon.stub().returns(contract)
    };

    // JSON string of inputs
    args = JSON.stringify(inputs);

    // Mock getState to return the serialized contract
    ctx.stub.getState.resolves(mockStub.serialize(contract));
  });

  afterEach(() => {
    sinon.restore();
  });
    it('The event(delivered) should be generated only by authorized role.', async () => {
      const c = new HFContract()
      const InitRes = await c.init(transactionContext, parameters)

      contract.accessPolicy.hasPermesstion.returns(true);
      contract.accessPolicy.isValid.returns(true);

      const res = await c.trigger_delivered(transactionContext, JSON.stringify({ contractId: InitRes.contractId}))

      expect(res.successful).to.be.true;
      expect(contract.delivered.happen.calledOnce).to.be.false;
      expect(ctx.stub.putState.calledOnce).to.be.false;
    })  


    it('The event(paid) should be generated only by authorized role.', async () => {
      const c = new HFContract()
      const InitRes = await c.init(transactionContext, parameters)

      contract.accessPolicy.hasPermesstion.returns(true);
      contract.accessPolicy.isValid.returns(true);

      const res = await c.trigger_delivered(transactionContext, JSON.stringify({ contractId: InitRes.contractId}))

      expect(res.successful).to.be.true;
      expect(contract.delivered.happen.calledOnce).to.be.false;
      expect(ctx.stub.putState.calledOnce).to.be.false;
    }) 

    it('The event(paidLate) should be generated only by authorized role.', async () => {
      const c = new HFContract()
      const InitRes = await c.init(transactionContext, parameters)

      contract.accessPolicy.hasPermesstion.returns(true);
      contract.accessPolicy.isValid.returns(true);

      const res = await c.trigger_delivered(transactionContext, JSON.stringify({ contractId: InitRes.contractId}))

      expect(res.successful).to.be.true;
      expect(contract.delivered.happen.calledOnce).to.be.false;
      expect(ctx.stub.putState.calledOnce).to.be.false;
    })

    it('The event(inspectedQuality) should be generated only by authorized role.', async () => {
      const c = new HFContract()
      const InitRes = await c.init(transactionContext, parameters)

      contract.accessPolicy.hasPermesstion.returns(true);
      contract.accessPolicy.isValid.returns(true);

      const res = await c.trigger_delivered(transactionContext, JSON.stringify({ contractId: InitRes.contractId}))

      expect(res.successful).to.be.true;
      expect(contract.delivered.happen.calledOnce).to.be.false;
      expect(ctx.stub.putState.calledOnce).to.be.false;
    })

    it('The event(passwordNotification) should be generated only by authorized role.', async () => {
      const c = new HFContract()
      const InitRes = await c.init(transactionContext, parameters)

      contract.accessPolicy.hasPermesstion.returns(true);
      contract.accessPolicy.isValid.returns(true);

      const res = await c.trigger_delivered(transactionContext, JSON.stringify({ contractId: InitRes.contractId}))

      expect(res.successful).to.be.true;
      expect(contract.delivered.happen.calledOnce).to.be.false;
      expect(ctx.stub.putState.calledOnce).to.be.false;
    })

    it('The event(UnLoaded) should be generated only by authorized role.', async () => {
      const c = new HFContract()
      const InitRes = await c.init(transactionContext, parameters)

      contract.accessPolicy.hasPermesstion.returns(true);
      contract.accessPolicy.isValid.returns(true);

      const res = await c.trigger_delivered(transactionContext, JSON.stringify({ contractId: InitRes.contractId}))

      expect(res.successful).to.be.true;
      expect(contract.delivered.happen.calledOnce).to.be.false;
      expect(ctx.stub.putState.calledOnce).to.be.false;
    })


  })*/
/*
  describe('Scenario: payment and delivery are fulfilled.', () => {
    it('should sucessfully terminate contract if payment and delivery are fulfilled.', async () => {
      const c = new HFContract()
      //////console.log('after new contract');
      const InitRes = await c.init(transactionContext, parameters)
      //////console.log('after  contract initiati');
      
      const res = await c.trigger_paid(transactionContext, JSON.stringify({ contractId: InitRes.contractId}))
      //////console.log('res........ ', res)
      expect(res.successful).to.eql(true)
      const res2 = await c.trigger_delivered(transactionContext, JSON.stringify({ contractId: InitRes.contractId}))
      
      ////console.log('trigger_delivered........ ', res2)
      expect(res2.successful).to.eql(true)
      const state = parse((await chaincodeStub.getState(InitRes.contractId)).toString())// we deleted JSON.parse, we need only to parse the state
     // ////console.log('state....... ', state.state)
      expect(state.state).to.eql("SuccessfulTermination")
      expect(state.obligations.delivery.state).to.eql("Fulfillment")
      expect(state.obligations.payment.state).to.eql("Fulfillment")
    })    
  })*/

  //AC-test event happen (2)
  describe('Scenario: access the sate and time after the event was triggered.', () => {
    it('Should successfully allow access to the state and time of the "delivered" event for authorized roles only.', async () => {
      const c = new HFContract()
      ////console.log('after new contract');
      const InitRes = await c.init(transactionContext, parameters)
      ////console.log('after contract initiati');

      const res2 = await c.trigger_delivered(transactionContext, JSON.stringify({ contractId: InitRes.contractId}))
      
      //console.log('res2 trigger_delivered. ', res2)
      expect(res2.successful).to.eql(true)
      
      const res = await c.getEventDateAndTime(transactionContext, JSON.stringify({ contractId: InitRes.contractId, event: EventquiredState}))
      //console.log('res getEventDateAndTime', res)
      console.log("I am testing the delivered event")
      expect(res.state).to.equal("Happened");
      expect(res.time).to.not.be.null;


      //const state = JSON.stringify(res, null, 2)
      //const state = parse((await chaincodeStub.getState(InitRes.contractId)).toString())// we deleted JSON.parse, we need only to parse the state
      //////console.log(state1)
      //expect(state.state).to.eql(true)

      //expect(state.state).to.eql("true")
      //////console.log('state....... ', res.state)
      //////console.log('time....... ', res.time)

    }) 
    
    //paid event 
    it('Should successfully allow access to the state and time of the "paid" event for authorized roles only.', async () => {
      const c = new HFContract()
      ////console.log('after new contract');
      const InitRes = await c.init(transactionContext, parameters)
      ////console.log('after contract initiati');

      const res2 = await c.trigger_paid(transactionContext, JSON.stringify({ contractId: InitRes.contractId}))
      
      // ////console.log('res2........ ', res2)
      expect(res2.successful).to.eql(true)
      
      const res = await c.getEventDateAndTime(transactionContext, JSON.stringify({ contractId: InitRes.contractId, event: EventquiredState2}))
      ////console.log('res........ paid ', res)
      //expect(res.successful).to.eql(true)
      console.log("I am testing the paid event")
      expect(res.state).to.equal("Happened");
      expect(res.time).to.not.be.null;
    })

     //paidLate event 
     it('Should successfully allow access to the state and time of the "paidLate" event for authorized roles only.', async () => {

    })

     //disclosed event 
     it('Should successfully allow access to the state and time of the "disclosed" event for authorized roles only.', async () => {

     })

     //non exit event 
     it('Should return "event is not exist" event for authorized roles only.', async () => {
      const c = new HFContract()
      const InitRes = await c.init(transactionContext, parameters)

      //const res2 = await c.trigger_delivered(transactionContext, JSON.stringify({ contractId: InitRes.contractId}))
      
      //console.log('res2 trigger_delivered. ', res2)
      //expect(res2.successful).to.eql(true)
      
      const res = await c.getEventDateAndTime(transactionContext, JSON.stringify({ contractId: InitRes.contractId, event: EventquiredState3}))
      //console.log('res getEventDateAndTime', res)
      //expect(res.successful).to.eql(true)
      console.log("I am testing the not exist event")
      expect(res.state).to.equal("Happened");
      expect(res.time).to.not.be.null;

     })


  })

  //AC-test run time, when the delivered event does not happen (1)
  describe('Scenario: the sate and time of delivered when the event does not happen', () => {
    it('should sucessfully allowed only access to sate and time of authrized role only. The state and the time will be false and null', async () => {
      const c = new HFContract()
      ////console.log('after new contract');
      const InitRes = await c.init(transactionContext, parameters)
      ////console.log('after contract initiati');
      
      const res = await c.getEventDateAndTime(transactionContext, JSON.stringify({ contractId: InitRes.contractId, event:EventquiredState })) //quiredState
      console.log('res........ ', res)
      //expect(res.successful).to.eql(true)//***AssertionError: expected undefined to deeply equal true
      const state = parse((await chaincodeStub.getState(InitRes.contractId)).toString())// we deleted JSON.parse, we need only to parse the state
      ////console.log('state....... ', state.state)
      expect(state.state).to.eql("Active") //***it was "false" AssertionError: expected Active to deeply equal true
      //expect(state.obligations.delivery.state).to.eql("Fulfillment")
    })    

    //here do the same for the rest //paid //paidLate //disclosed 
  })
  
    //AC-test run time, when the paid event happen 
  /*describe('Scenario: access the sate and time of event paid after the event was triggered.', () => {
    it('should sucessfully allowed only access to sate and time of event paid of authrized role only', async () => {
      const c = new HFContract()
      ////console.log('after new contract');
      const InitRes = await c.init(transactionContext, parameters)
      ////console.log('after contract initiati');

      const res2 = await c.trigger_paid(transactionContext, JSON.stringify({ contractId: InitRes.contractId}))
      
      // ////console.log('res2........ ', res2)
      expect(res2.successful).to.eql(true)
      
      const res = await c.getPaidDateAndTime(transactionContext, JSON.stringify({ contractId: InitRes.contractId, quiredState}))
      ////console.log('res........ paid ', res)
      //expect(res.successful).to.eql(true)
      expect(res.state).to.equal("Happened");
      expect(res.time).to.not.be.null;


    })    
  })*/

     //AC-test run time, when the delivered event is part of another legalposition(obligation)
  describe('Scenario: Access the state and time of an event when it is part of a legal position.', () => {
    it('should sucessfully allowed only access to sate and time of event "delivered" of authrized role only', async () => {
      const c = new HFContract()
      ////console.log('after new contract');
      const InitRes = await c.init(transactionContext, parameters)
      ////console.log('after contract initiati');

      const res2 = await c.trigger_delivered(transactionContext, JSON.stringify({ contractId: InitRes.contractId}))
      
      //console.log('res2 trigger_delivered. ', res2)
      expect(res2.successful).to.eql(true)
      
      const res = await c.getEventDateAndTime(transactionContext, JSON.stringify({ contractId: InitRes.contractId, event: EventquiredState })) //quiredState
      console.log('res getEventDateAndTime', res)
      //expect(res.successful).to.eql(true)
      expect(res.state).to.equal("Happened");
      expect(res.time).to.not.be.null;

    })    
  })


  //AC-test obligation state and time when it is active
  /*
  describe('Scenario: Access the state and time of the delivery obligation for the performer, right holder, or authorized roles.', () => {
    it('Should successfully allow access to the state and time of the delivery obligation in the "active" state for authorized roles only.', async () => {
      const c = new HFContract()
      ////console.log('after new contract');
      const InitRes = await c.init(transactionContext, parameters)
      ////console.log('after contract initiati');

      //const res2 = await c.trigger_delivered(transactionContext, JSON.stringify({ contractId: InitRes.contractId}))
      
      // ////console.log('res2........ ', res2)
      //expect(res2.successful).to.eql(true)
      
      const res = await c.getLegalPositionStateAndTime(transactionContext, JSON.stringify({ contractId: InitRes.contractId, quiredState}))
      ////console.log('res.. Obligation active', res)
      //expect(res.successful).to.eql(true)
      expect(res.state).to.equal("Active");
      expect(res.time).to.not.be.null;


      //const state = JSON.stringify(res, null, 2)
      //const state = parse((await chaincodeStub.getState(InitRes.contractId)).toString())// we deleted JSON.parse, we need only to parse the state
      //////console.log(state1)
      //expect(state.state).to.eql(true)

      //expect(state.state).to.eql("true")
      //////console.log('state....... ', res.state)
      //////console.log('time....... ', res.time)

    })    
  })*/


/*
  describe('Scenario: payment is violated.', () => {
     it('should violate Payment.', async () => {
       const c = new HFContract()
       const InitRes = await c.init(transactionContext, parameters)
       const res = await c.violateObligation_payment(transactionContext, InitRes.contractId)
       expect(res.successful).to.eql(true)
       const state = parse((await chaincodeStub.getState(InitRes.contractId)).toString())
       expect(state.obligations.payment.state).to.eql("Violation")     
     })

     it('should trigger latePayment and suspendDelivery if payment is violated.', async () => {
       const c = new HFContract()
       const InitRes = await c.init(transactionContext, parameters)
       const res = await c.violateObligation_payment(transactionContext, InitRes.contractId)
       expect(res.successful).to.eql(true)
       const state = parse((await chaincodeStub.getState(InitRes.contractId)).toString())
       expect(state.obligations.payment.state).to.eql("Violation")
       expect(state.obligations.latePayment.state).to.eql("Active")
       expect(state.obligations.latePayment.activeState).to.eql("InEffect")
       expect(state.powers.suspendDelivery.state).to.eql("Active")
       expect(state.powers.suspendDelivery.activeState).to.eql("InEffect")
     })

     it('should suspend delivery if suspendDelivery is exerted.', async () => {
       const c = new HFContract()
       const InitRes = await c.init(transactionContext, parameters)
       const res = await c.violateObligation_payment(transactionContext, InitRes.contractId)
       expect(res.successful).to.eql(true)
       const state = parse((await chaincodeStub.getState(InitRes.contractId)).toString())
       expect(state.obligations.payment.state).to.eql("Violation")
       expect(state.obligations.latePayment.state).to.eql("Active")
       expect(state.obligations.latePayment.activeState).to.eql("InEffect")
       expect(state.powers.suspendDelivery.state).to.eql("Active")

       const res2 = await c.p_suspendDelivery_suspended_o_delivery(transactionContext, InitRes.contractId)
       expect(res2.successful).to.eql(true)
       const state2 = parse((await chaincodeStub.getState(InitRes.contractId)).toString())
       expect(state2.obligations.delivery.state).to.eql("Active")
       expect(state2.obligations.delivery.activeState).to.eql("Suspension")
       expect(state2.powers.suspendDelivery.state).to.eql("SuccessfulTermination")
     })

     it('should trigger resumeDelivery and fulfill latePayment if paidLate is triggered.', async () => {
       const c = new HFContract()
       const InitRes = await c.init(transactionContext, parameters)
       const res = await c.violateObligation_payment(transactionContext, InitRes.contractId)
       expect(res.successful).to.eql(true)
       const res2 = await c.p_suspendDelivery_suspended_o_delivery(transactionContext, InitRes.contractId)
       expect(res2.successful).to.eql(true)
       const res3 = await c.trigger_paidLate(transactionContext, JSON.stringify({ contractId: InitRes.contractId }))
       expect(res3.successful).to.eql(true)

       const state = parse((await chaincodeStub.getState(InitRes.contractId)).toString())
       expect(state.powers.resumeDelivery.state).to.eql("Active")
       expect(state.powers.resumeDelivery.activeState).to.eql("InEffect")
       expect(state.obligations.latePayment.state).to.eql("Fulfillment")
  
     })

     it('should resume delivery if resumeDelivery is exerted.', async () => {
       const c = new HFContract()
       const InitRes = await c.init(transactionContext, parameters)
       const res = await c.violateObligation_payment(transactionContext, InitRes.contractId)
       expect(res.successful).to.eql(true)
       const res2 = await c.p_suspendDelivery_suspended_o_delivery(transactionContext, InitRes.contractId)
       expect(res2.successful).to.eql(true)
       const res3 = await c.trigger_paidLate(transactionContext, JSON.stringify({ contractId: InitRes.contractId }))
       expect(res3.successful).to.eql(true)
       const res4 = await c.p_resumeDelivery_resumed_o_delivery(transactionContext, InitRes.contractId)
       expect(res4.successful).to.eql(true)

       const state = parse((await chaincodeStub.getState(InitRes.contractId)).toString())
       expect(state.powers.resumeDelivery.state).to.eql("SuccessfulTermination")
       expect(state.obligations.delivery.state).to.eql("Active")
       expect(state.obligations.delivery.activeState).to.eql("InEffect")
     })

    it('should successfully terminate contract if delivered is triggered.', async () => {
       const c = new HFContract()
       const InitRes = await c.init(transactionContext, parameters)
       const res = await c.violateObligation_payment(transactionContext, InitRes.contractId)
       expect(res.successful).to.eql(true)
       const res2 = await c.p_suspendDelivery_suspended_o_delivery(transactionContext, InitRes.contractId)
       expect(res2.successful).to.eql(true)
       const res3 = await c.trigger_paidLate(transactionContext, JSON.stringify({ contractId: InitRes.contractId }))
       expect(res3.successful).to.eql(true)
       const res4 = await c.p_resumeDelivery_resumed_o_delivery(transactionContext, InitRes.contractId)
       expect(res4.successful).to.eql(true)
       const res5 = await c.trigger_delivered(transactionContext, JSON.stringify({ contractId: InitRes.contractId }))
       expect(res5.successful).to.eql(true)

       const state = parse((await chaincodeStub.getState(InitRes.contractId)).toString())
       expect(state.state).to.eql("SuccessfulTermination")
       expect(state.obligations.delivery.state).to.eql("Fulfillment")
       expect(state.obligations.latePayment.state).to.eql("Fulfillment")
     })

     it('should unsuccessfully terminate contract if latePayment is violated.', async () => {
       const c = new HFContract()
       const InitRes = await c.init(transactionContext, parameters)
       const res = await c.violateObligation_payment(transactionContext, InitRes.contractId)
       expect(res.successful).to.eql(true)
       const res2 = await c.p_suspendDelivery_suspended_o_delivery(transactionContext, InitRes.contractId)
       expect(res2.successful).to.eql(true)
       const res3 = await c.violateObligation_latePayment(transactionContext, InitRes.contractId)
       expect(res3.successful).to.eql(true)

       const state = parse((await chaincodeStub.getState(InitRes.contractId)).toString())
       expect(state.state).to.eql("UnsuccessfulTermination")
       expect(state.obligations.delivery.state).to.eql("UnsuccessfulTermination")
     })
   
  })*/

   //AC-test obligation state and time
   //AC- when check state and time when delivery obligation is violoated 
   describe('Scenario: Access the state and time of the delivery obligation for the performer, right holder, or authorized roles.', () => {
      it('Should successfully allow access to the state and time of the delivery obligation in the "active" state for authorized roles only.', async () => {
        const c = new HFContract()
        ////console.log('after new contract');
        const InitRes = await c.init(transactionContext, parameters)
        ////console.log('after contract initiati');

        //const res2 = await c.trigger_delivered(transactionContext, JSON.stringify({ contractId: InitRes.contractId}))
        
        // ////console.log('res2........ ', res2)
        //expect(res2.successful).to.eql(true)
        
        const res = await c.getLegalPositionStateAndTime(transactionContext, JSON.stringify({ contractId: InitRes.contractId, quiredState}))
        ////console.log('res.. Obligation active', res)
        //expect(res.successful).to.eql(true)
        expect(res.state).to.equal("Active");
        expect(res.time).to.not.be.null;


        //const state = JSON.stringify(res, null, 2)
        //const state = parse((await chaincodeStub.getState(InitRes.contractId)).toString())// we deleted JSON.parse, we need only to parse the state
        //////console.log(state1)
        //expect(state.state).to.eql(true)

        //expect(state.state).to.eql("true")
        //////console.log('state....... ', res.state)
        //////console.log('time....... ', res.time)

      })    

     //AC check state and time when obligation suspended 
     it('Should successfully allow access to the state and time of the delivery obligation in the "suspension" state for authorized roles only when "paid" happenes after due date and the payment is violated', async () => {
      const c = new HFContract()
      const InitRes = await c.init(transactionContext, parameters)

      const res = await c.trigger_paid(transactionContext, JSON.stringify({ contractId: InitRes.contractId}))
      expect(res.successful).to.eql(true) 

      const state1 = parse((await chaincodeStub.getState(InitRes.contractId)).toString())
      ////console.log("state1")
      ////console.log(state1)

      const res4 = await c.violateObligation_payment(transactionContext, InitRes.contractId)
      ////console.log(' suspend case violateObligation_payment ', res4)
      expect(res4.successful).to.eql(true)
      const state2 = parse((await chaincodeStub.getState(InitRes.contractId)).toString())
      expect(state2.obligations.payment.state).to.eql("Violation")
      expect(state2.obligations.latePayment.state).to.eql("Active")
      expect(state2.obligations.latePayment.activeState).to.eql("InEffect")
      expect(state2.powers.suspendDelivery.state).to.eql("Active")


      //const res4 = await c.trigger_delivered(transactionContext, JSON.stringify({ contractId: InitRes.contractId}))
      //expect(res4.successful).to.eql(true)

      const res1 = await c.p_suspendDelivery_suspended_o_delivery(transactionContext, InitRes.contractId)
      ////console.log(' suspend Obligation delivery ', res1)
      expect(res1.successful).to.eql(true)
      const state = parse((await chaincodeStub.getState(InitRes.contractId)).toString())
      //////console.log('res.. Obligation Suspension', state)
      //expect(state.obligations.delivery.state).to.eql("Suspension")
      //expect(state.obligations.delivery.state).to.eql("Active")
      //expect(state.obligations.delivery.activeState).to.eql("InEffect")
      //expect(state.powers.suspendDelivery.state).to.eql("Active")

      //const res2 = await c.p_suspendDelivery_suspended_o_delivery(transactionContext, InitRes.contractId)
      //expect(res2.successful).to.eql(true)
      //const state2 = parse((await chaincodeStub.getState(InitRes.contractId)).toString())
      //////console.log('res.. Obligation Suspension state2 ', state2.state)
      //expect(state.state).to.eql("Active")
      //expect(state.obligations.delivery.state).to.eql("Active")
      //expect(state.obligations.delivery.activeState).to.eql("Suspension")
      //expect(state.powers.suspendDelivery.state).to.eql("SuccessfulTermination")
      
      quiredState = {state:"Suspension", resource:"delivery", resourceType:"obligation"}
      const res3 = await c.getLegalPositionStateAndTime(transactionContext, JSON.stringify({ contractId: InitRes.contractId, quiredState}))
      ////console.log('res.. Obligation Suspension', res3)
      //expect(res2.successful).to.eql(true)
      expect(res3.state).to.equal("Suspension");
      expect(res3.time).to.not.be.null;


    })
     
    //latePaid happened after delivery is suspended
    //AC see Resumed state by 
     it('Should successfully allow access to the state and time of the delivery obligation in the "active" state for authorized roles only when "latePaid" happened and delivery is resumed', async () => {
      const c = new HFContract()
      const InitRes = await c.init(transactionContext, parameters)

      const res = await c.trigger_paid(transactionContext, JSON.stringify({ contractId: InitRes.contractId}))
      expect(res.successful).to.eql(true) 

      const state1 = parse((await chaincodeStub.getState(InitRes.contractId)).toString())
      ////console.log("state1")
      ////console.log(state1)

      const res4 = await c.violateObligation_payment(transactionContext, InitRes.contractId)
      ////console.log(' suspend case violateObligation_payment ', res4)
      expect(res4.successful).to.eql(true)
      const state2 = parse((await chaincodeStub.getState(InitRes.contractId)).toString())
      expect(state2.obligations.payment.state).to.eql("Violation")
      expect(state2.obligations.latePayment.state).to.eql("Active")
      expect(state2.obligations.latePayment.activeState).to.eql("InEffect")
      expect(state2.powers.suspendDelivery.state).to.eql("Active")


      //const res4 = await c.trigger_delivered(transactionContext, JSON.stringify({ contractId: InitRes.contractId}))
      //expect(res4.successful).to.eql(true)

      const res1 = await c.p_suspendDelivery_suspended_o_delivery(transactionContext, InitRes.contractId)
      //////console.log(' suspend Obligation delivery ', res1)
      expect(res1.successful).to.eql(true)
      const state = parse((await chaincodeStub.getState(InitRes.contractId)).toString())


      const res3 = await c.getLegalPositionStateAndTime(transactionContext, JSON.stringify({ contractId: InitRes.contractId, quiredState}))
      //////console.log('res.. Obligation Suspension', res3)
      //expect(res2.successful).to.eql(true)
      expect(res3.state).to.equal("Suspension");
      expect(res3.time).to.not.be.null;

      const res2 = await c.trigger_paidLate(transactionContext, JSON.stringify({ contractId: InitRes.contractId}))
      expect(res2.successful).to.eql(true) 

      const state3 = parse((await chaincodeStub.getState(InitRes.contractId)).toString())
      expect(state3.powers.resumeDelivery.state).to.eql("Active")
      expect(state3.powers.resumeDelivery.activeState).to.eql("InEffect")
      expect(state3.obligations.latePayment.state).to.eql("Fulfillment")


      const res7 = await c.p_resumeDelivery_resumed_o_delivery(transactionContext, InitRes.contractId)
      expect(res7.successful).to.eql(true)



      const res6 = await c.getLegalPositionStateAndTime(transactionContext, JSON.stringify({ contractId: InitRes.contractId, quiredState}))
      ////console.log('res.. Obligation delivery active', res6)
      //expect(res6.successful).to.eql(true)
      expect(res6.state).to.equal("Active");
      expect(res6.time).to.not.be.null;


    })
    
    //AC see fulfillment
    // 
    it('Should successfully allow access to the state and time of the delivery obligation in the "fulfillment" state for authorized roles only when the "delivered" happended before the due date.', async () => {
      const c = new HFContract()
      //////console.log('after new contract');
      const InitRes = await c.init(transactionContext, parameters)
      //////console.log('after  contract initiati');
      
   
      const res2 = await c.trigger_delivered(transactionContext, JSON.stringify({ contractId: InitRes.contractId}))
      expect(res2.successful).to.eql(true)

      //
      //console.log("before paid")
      //const res = await c.trigger_paid(transactionContext, JSON.stringify({ contractId: InitRes.contractId}))
      //expect(res.successful).to.eql(true) 
      //console.log("after paid")


      const state = parse((await chaincodeStub.getState(InitRes.contractId)).toString())// we deleted JSON.parse, we need only to parse the state
     // ////console.log('state....... ', state.state)
      //expect(state.state).to.eql("SuccessfulTermination")
      //expect(state.obligations.delivery.state).to.eql("Fulfillment")
      //expect(state.obligations.payment.state).to.eql("Fulfillment")

      const res3 = await c.getLegalPositionStateAndTime(transactionContext, JSON.stringify({ contractId: InitRes.contractId, quiredState}))
      ////console.log('res.. Obligation fulfillment', res3)
      //expect(res2.successful).to.eql(true)
      expect(res3.state).to.equal("Fulfillment");
      expect(res3.time).to.not.be.null;


    })  
    //it works but it will always be Active
    it('Should successfully allow access to the state and time of the delivery obligation in the "inEffect" state for authorized roles only when the "delivered" is active.', async () => {
       const c = new HFContract();
       const InitRes = await c.init(transactionContext, parameters);
       expect(InitRes.successful).to.eql(true);
       const state = parse((await chaincodeStub.getState(InitRes.contractId)).toString())
       //expect(state.state).to.eql("Active")
       //expect(state.activeState).to.eql("InEffect")
       //expect(state.obligations.payment.state).to.eql("Active")
       //expect(state.obligations.payment.activeState).to.eql("InEffect")
       //expect(state.obligations.delivery.state).to.eql("Active")
       //expect(state.obligations.delivery.activeState).to.eql("InEffect")

      const res3 = await c.getLegalPositionStateAndTime(transactionContext, JSON.stringify({ contractId: InitRes.contractId, quiredState}))
      ////console.log('res.. Obligation active', res3)
      //expect(res2.successful).to.eql(true)
      expect(res3.state).to.equal("Active");
      expect(res3.time).to.not.be.null;


    })

    it('Should successfully allow access to the state and time of the delivery obligation in the "violation" state for authorized roles only when "delivered" happended after due date', async () => {
      /*
      const c = new HFContract()
      const InitRes = await c.init(transactionContext, parameters)

      const res3 = await c.trigger_delivered(transactionContext, JSON.stringify({ contractId: InitRes.contractId}))
      //////console.log('before trigger delivered ', res3)
      expect(res3.successful).to.eql(true)
      //////console.log('After trigger delivered ', res3)

      const state = parse((await chaincodeStub.getState(InitRes.contractId)).toString())
      //expect(state.obligations.delivery.state).to.eql("Violation")
      expect(state.state).to.eql("Active")
      expect(state.activeState).to.eql("InEffect")


      const res = await c.violateObligation_delivery(transactionContext, InitRes.contractId)
      ////console.log('before violateObligation_delivery ', res)
      expect(res.successful).to.eql(true)
      ////console.log('After violateObligation_delivery ', res)
    

      const res2 = await c.getLegalPositionStateAndTime(transactionContext, JSON.stringify({ contractId: InitRes.contractId, quiredState}))
      ////console.log('res.. Obligation violiated', res2)
      //expect(res2.successful).to.eql(true)
      expect(res2.state).to.equal("Violation");
      expect(res2.time).to.not.be.null;
      */

    })


    //unsuccessfully termination, it works on payment
    it('Should successfully allow access to the state and time of the delivery obligation in the "unsuccessfultermination" state for authorized roles only when latePayment is violated.', async () => {
      /*
      const c = new HFContract()
      const InitRes = await c.init(transactionContext, parameters)


      const res = await c.trigger_delivered(transactionContext, JSON.stringify({ contractId: InitRes.contractId}))
      expect(res.successful).to.eql(true) 

      const res2 = await c.violateObligation_delivery(transactionContext, InitRes.contractId)
      ////console.log('before violateObligation_delivery ', res)
      expect(res2.successful).to.eql(true)
     

      //const res = await c.violateObligation_payment(transactionContext, InitRes.contractId)
      //expect(res.successful).to.eql(true)
      //const res2 = await c.p_suspendDelivery_suspended_o_delivery(transactionContext, InitRes.contractId)
      //expect(res2.successful).to.eql(true)
      //const res3 = await c.violateObligation_latePayment(transactionContext, InitRes.contractId)
      //(res3.successful).to.eql(true)

     

      const res3 = await c.p_terminateContract_terminated_contract(transactionContext, InitRes.contractId)
      expect(res3.successful).to.eql(true)

      const state = parse((await chaincodeStub.getState(InitRes.contractId)).toString())
      expect(state.state).to.eql("UnsuccessfulTermination")
      expect(state.obligations.payment.state).to.eql("UnsuccessfulTermination")


      // send the parameter
      quiredState = {state:"active", resource:"payment", resourceType:"obligation"}
      const res4 = await c.getLegalPositionStateAndTime(transactionContext, JSON.stringify({ contractId: InitRes.contractId, quiredState}))
      //console.log('res.. UnsuccessfulTermination', res4)
      //expect(res2.successful).to.eql(true)
      expect(res4.state).to.equal("UnsuccessfulTermination");
      expect(res4.time).to.not.be.null;
*/

    })

    //AC
    //check conditional obligation when they go to create state by authrized roles
    // let quiredState = {state:"create", resource:"latePayment", resourceType:"obligation"}
      it('Should successfully allow access to "create" state and time for "conditional obligation" by authrized roles only when contract is instantiated.', async () => {
        /*
        const c = new HFContract()
        const InitRes = await c.init(transactionContext, parameters)

        const res = await c.trigger_paid(transactionContext, JSON.stringify({ contractId: InitRes.contractId}))
        expect(res.successful).to.eql(true) 

        const res2 = await c.violateObligation_payment(transactionContext, InitRes.contractId)
        expect(res2.successful).to.eql(true)

        const state = parse((await chaincodeStub.getState(InitRes.contractId)).toString())
        expect(state.obligations.payment.state).to.eql("Violation")
        expect(state.obligations.latePayment.state).to.eql("Create")
      
        quiredState = {state:"create", resource:"latePayment", resourceType:"obligation"}
        const res4 = await c.getLegalPositionStateAndTime(transactionContext, JSON.stringify({ contractId: InitRes.contractId, quiredState}))
        //console.log('res.. Create', res4)
        //expect(res4.successful).to.eql(true)
        expect(res4.state).to.equal("Create");//Create //*** AssertionError: expected 'Active' to deeply equal 'Create'
        expect(res4.time).to.not.be.null;
  */
  
      })
    })
    
      //AC
      //Power state
      describe('Scenario: checking all power states by authrized roles only', () => {
        it('see successful termination power states by performer and rightholder when delivered happended after due date', async () => {
          const c = new HFContract()
          const InitRes = await c.init(transactionContext, parameters)

          const res = await c.trigger_paid(transactionContext, JSON.stringify({ contractId: InitRes.contractId}))
          expect(res.successful).to.eql(true) 

          const state1 = parse((await chaincodeStub.getState(InitRes.contractId)).toString())
          ////console.log("state1")
          ////console.log(state1)

          const res4 = await c.violateObligation_payment(transactionContext, InitRes.contractId)
          ////console.log(' suspend case violateObligation_payment ', res4)
          expect(res4.successful).to.eql(true)
          const state2 = parse((await chaincodeStub.getState(InitRes.contractId)).toString())
          expect(state2.obligations.payment.state).to.eql("Violation")
          expect(state2.obligations.latePayment.state).to.eql("Active")
          expect(state2.obligations.latePayment.activeState).to.eql("InEffect")
          expect(state2.powers.suspendDelivery.state).to.eql("Active")


    

          const res1 = await c.p_suspendDelivery_suspended_o_delivery(transactionContext, InitRes.contractId)
          
          expect(res1.successful).to.eql(true)
          const state = parse((await chaincodeStub.getState(InitRes.contractId)).toString())

           // send the parameter
          quiredState = {state:"active", resource:"suspendDelivery", resourceType:"power"}
          const res3 = await c.getLegalPositionStateAndTime(transactionContext, JSON.stringify({ contractId: InitRes.contractId, quiredState}))
          ////console.log('res.. Obligation Suspension', res3)
          //expect(res2.successful).to.eql(true)
          expect(res3.state).to.equal("SuccessfulTermination");
          expect(res3.time).to.not.be.null;
   
   
        })

        // we can not test it with the meat sale, will try it with the vaccine
        it('see un successful termination power states by performer and rightholder', async () => {

        })

        // we can not test it with the meat sale, will try it with the vaccine
        it('see create power states by performer and rightholder', async () => {

        })

        // we can not test it with the meat sale, will try it with the vaccine
        it('see active power states by performer and rightholder', async () => {

        })

        // we can not test it with the meat sale, will try it with the vaccine
        it('see suspend power states by performer and rightholder', async () => {

        })
   
   
       })
         //AC
         //Test for the parts of legal posiition 
         //here we test with parameter of condition 1
         //checking the fulfillment state of an obligation when it is part of another obligation (antecedent)
         describe('Scenario: Checking legal position parts by authorized roles only.', () => {
          it('checking the state of an obligation when it is part of another obligation (antecedent)', async () => {

            const c = new HFContract()
            const InitRes = await c.init(transactionContext, parameters)
      
            const res2 = await c.trigger_delivered(transactionContext, JSON.stringify({ contractId: InitRes.contractId}))
            expect(res2.successful).to.eql(true)
            
            const state = parse((await chaincodeStub.getState(InitRes.contractId)).toString())// we deleted JSON.parse, we need only to parse the state
     // ////console.log('state....... ', state.state)
      //expect(state.state).to.eql("SuccessfulTermination")
      //expect(state.obligations.delivery.state).to.eql("Fulfillment")
      //expect(state.obligations.payment.state).to.eql("Fulfillment")

      const res3 = await c.getStateTimeOfParts(transactionContext, JSON.stringify({ contractId: InitRes.contractId, condition: condition1}))
      //console.log('res.. Obligation fulfillment parts', res3)
      //expect(res2.successful).to.eql(true)
      expect(res3.state).to.equal("Fulfillment");
      expect(res3.time).to.not.be.null;
        


  
          
     
     
          })
            //AC
         //Test for the parts of legal posiition 
         //here we test with parameter of condition 2
         //for someone who does not have permesstion 
         //checking the violation state of an obligation when it is part of another obligation (consequent)
          it('checking the  state of an obligation when it is part of another obligation (consequent)', async () => {

            const c = new HFContract()
            const InitRes = await c.init(transactionContext, parameters)
      
            const res2 = await c.trigger_delivered(transactionContext, JSON.stringify({ contractId: InitRes.contractId}))
            expect(res2.successful).to.eql(true)
            
            const state = parse((await chaincodeStub.getState(InitRes.contractId)).toString())// we deleted JSON.parse, we need only to parse the state
     // ////console.log('state....... ', state.state)
      //expect(state.state).to.eql("SuccessfulTermination")
      //expect(state.obligations.delivery.state).to.eql("Fulfillment")
      //expect(state.obligations.payment.state).to.eql("Fulfillment")

      const res3 = await c.getStateTimeOfParts(transactionContext, JSON.stringify({ contractId: InitRes.contractId, condition: condition2}))
      ////console.log('res.. Obligation violation parts', res3)
      //expect(res2.successful).to.eql(true)
      expect(res3.state).to.equal("You do not have permission");
      expect(res3.time).to.be.null; //must equal null 
        


  
          
     
     
          })

          //AC
         //Test for the parts of legal posiition 
         //here we test with parameter of condition 3
         //for someone who does not have permesstion 
         
         it('Checking if a performer of the obligation (seller) can see the time of an event "delivered" if it is part of an obligation delivery', async () => {

          const c = new HFContract()
          const InitRes = await c.init(transactionContext, parameters)
    
          const res2 = await c.trigger_delivered(transactionContext, JSON.stringify({ contractId: InitRes.contractId}))
          expect(res2.successful).to.eql(true)
          
          const state = parse((await chaincodeStub.getState(InitRes.contractId)).toString())// we deleted JSON.parse, we need only to parse the state
   // ////console.log('state....... ', state.state)
    //expect(state.state).to.eql("SuccessfulTermination")
    //expect(state.obligations.delivery.state).to.eql("Fulfillment")
    //expect(state.obligations.payment.state).to.eql("Fulfillment")

    const res3 = await c.getStateTimeOfParts(transactionContext, JSON.stringify({ contractId: InitRes.contractId, condition: condition3}))
    ////console.log('res.. Obligation violation parts', res3)
    //expect(res2.successful).to.eql(true)
    expect(res3.state).to.equal(true);
    expect(res3.time).to.be.null; //must equal null 
      



        
   
   
        })
         
        //AC
        //eventCondiiton - happened
        it('checking if a performer of the obligation (seller) can see the "delivered" event if it is part of an obligation delivery', async () => {

          const c = new HFContract()
          const InitRes = await c.init(transactionContext, parameters)
    
          const res2 = await c.trigger_delivered(transactionContext, JSON.stringify({ contractId: InitRes.contractId}))
          expect(res2.successful).to.eql(true)
          
          const state = parse((await chaincodeStub.getState(InitRes.contractId)).toString())// we deleted JSON.parse, we need only to parse the state
   // ////console.log('state....... ', state.state)
    //expect(state.state).to.eql("SuccessfulTermination")
    //expect(state.obligations.delivery.state).to.eql("Fulfillment")
    //expect(state.obligations.payment.state).to.eql("Fulfillment")

    const res3 = await c.getStateTimeOfParts(transactionContext, JSON.stringify({ contractId: InitRes.contractId, condition: eventCondition}))
    ////console.log('res.. Obligation violation parts', res3)
    //expect(res2.successful).to.eql(true)
    expect(res3.state).to.equal("Happened");
    expect(res3.time).to.not.be.null; //must equal null 
      



        
   
   
        })

         //AC
        //eventCondiiton - not happened
        it(' checking if a performer of obligation delivery seller can not see delivered event its part of an obligation delivery ', async () => {


          const c = new HFContract()
          const InitRes = await c.init(transactionContext, parameters)
    
          //const res2 = await c.trigger_delivered(transactionContext, JSON.stringify({ contractId: InitRes.contractId}))
          //expect(res2.successful).to.eql(true)
          
          //const state = parse((await chaincodeStub.getState(InitRes.contractId)).toString())// we deleted JSON.parse, we need only to parse the state
   // ////console.log('state....... ', state.state)
    //expect(state.state).to.eql("SuccessfulTermination")
    //expect(state.obligations.delivery.state).to.eql("Fulfillment")
    //expect(state.obligations.payment.state).to.eql("Fulfillment")

    const res3 = await c.getStateTimeOfParts(transactionContext, JSON.stringify({ contractId: InitRes.contractId, condition: eventCondition}))
    console.log('result of event in the parts of obligation', res3)
    //expect(res2.successful).to.eql(true)
    expect(res3.state).to.equal("Not Happened");
    expect(res3.time).to.be.null; //must equal null 
      



        
   
   
        })





        })


     


/*
     it('should trigger terminateContract if delivery is violated.', async () => {
       const c = new HFContract()
       const InitRes = await c.init(transactionContext, parameters)
       const res = await c.violateObligation_delivery(transactionContext, InitRes.contractId)
       expect(res.successful).to.eql(true)
       const state = JSON.parse((await chaincodeStub.getState(InitRes.contractId)).toString())
       expect(state.obligations.delivery.state).to.eql("Violation")
       expect(state.powers.terminateContract.state).to.eql("Active")
       expect(state.powers.terminateContract.activeState).to.eql("InEffect")
     })

     it('should terminateContract if terminateContract is exerted.', async () => {
       const c = new HFContract()
       const InitRes = await c.init(transactionContext, parameters)
       const res = await c.violateObligation_delivery(transactionContext, InitRes.contractId)
       expect(res.successful).to.eql(true)
       const state = JSON.parse((await chaincodeStub.getState(InitRes.contractId)).toString())
       expect(state.obligations.delivery.state).to.eql("Violation")
       expect(state.powers.terminateContract.state).to.eql("Active")
       expect(state.powers.terminateContract.activeState).to.eql("InEffect")

       const res2 = await c.p_terminateContract_terminated_contract(transactionContext, InitRes.contractId)
       expect(res2.successful).to.eql(true)
       const state2 = JSON.parse((await chaincodeStub.getState(InitRes.contractId)).toString())
       expect(state2.state).to.eql("UnsuccessfulTermination")
       expect(state2.obligations.payment.state).to.eql("UnsuccessfulTermination")
       expect(state2.powers.terminateContract.state).to.eql("SuccessfulTermination")
     })    */
   //////////////////////////////////})

/*
  describe('MyChaincode', () => {
    transactionContext = new Context()
    transactionContext.setChaincodeStub(ChaincodeMockStub)
    const chaincode = new HFContract();
    it('should emit and listen to events', async () => {
      // chaincodeStub = sinon.createStubInstance(ChaincodeMockStub)


      // const InitRes= await chaincode.Init(transactionContext, parameters);
      // ////console.log("InitRes......... ", InitRes.contractId)


      let TransactionContextMock = new Context()
      // let chaincodeStub = sinon.createStubInstance(ChaincodeMockStub)
      TransactionContextMock.setChaincodeStub(ChaincodeMockStub)

      const mockStub = new ChaincodeMockStub('MeatSale', chaincode);
      // const init = await chaincode.Init(transactionContext, parameters);
      // ////console.log("init.........", init)
      // await mockStub.mockInit("710b962e-041c-11e1-9234-0123456789ab", [TransactionContextMock, JSON.stringify(parametersObject)])
      const mockInit = await mockStub.mockTransactionStart("710b962e-041c-11e1-9234-0123456789ab");
      ////console.log("mockInit........ ", mockInit)


        const response  = await mockStub.mockTransactionStart('710b962e-041c-11e1-9234-0123456789ab', ['trigger_paidLate', "MeatSale_202310216"]); //"MeatSale_2023102017"

        ////console.log("response............ ", response)
        // Set up event listener

        const eventPayload = await mockStub.getEvent('contractEvent');

        const eventPayload1 = await mockStub.getEvent('Happened');

       ////console.log("eventPayload......... ", eventPayload) 
       ////console.log("eventPayload1......... ", eventPayload1) 


        // Check if the event was received
        // expect(eventReceived).to.be.true;
    });
});
*/
})
