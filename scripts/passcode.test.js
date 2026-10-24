import test from 'node:test';
import assert from 'node:assert/strict';
import {createVerifier,verifyPasscode,validVerifier,nextFailure,sessionExpired,MAX_FAILURES,COOLDOWN_MS,IDLE_TIMEOUT_MS} from '../src/services/dashboardPasscode.js';

test('passcode verifier uses random salts and never stores plaintext',async()=>{
  const a=await createVerifier('73194628'),b=await createVerifier('73194628');
  assert.ok(validVerifier(a));assert.notEqual(a.salt,b.salt);assert.notEqual(a.digest,b.digest);
  assert.equal(JSON.stringify(a).includes('73194628'),false);
  assert.equal(await verifyPasscode('73194628',a),true);
  assert.equal(await verifyPasscode('73194629',a),false);
  assert.equal(await verifyPasscode('123',a),false);
  assert.equal(await verifyPasscode('73194628',{...a,digest:'broken'}),false);
});
test('passcodes reject short, long, and non-numeric input',async()=>{
  for(const pin of ['12345','1234567890123','letters','123 456'])await assert.rejects(createVerifier(pin));
});
test('five failures trigger a one-minute cooldown and expiry restarts the counter',()=>{
  const now=10000;let state={count:0,until:0};
  for(let i=1;i<MAX_FAILURES;i++){state=nextFailure(state,now);assert.equal(state.count,i);assert.equal(state.until,0)}
  state=nextFailure(state,now);assert.equal(state.until,now+COOLDOWN_MS);
  assert.deepEqual(nextFailure(state,now+1),state);
  assert.deepEqual(nextFailure(state,now+COOLDOWN_MS),{count:1,until:0});
  assert.equal(IDLE_TIMEOUT_MS,600000);
  assert.equal(sessionExpired(1000,600999),false);
  assert.equal(sessionExpired(1000,601000),true);
  assert.equal(sessionExpired(1000,900000),true);
});
