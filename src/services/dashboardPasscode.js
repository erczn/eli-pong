export const PIN_LENGTH = /^\d{6,12}$/;
export const IDLE_TIMEOUT_MS = 10 * 60 * 1000;
export const MAX_FAILURES = 5;
export const COOLDOWN_MS = 60 * 1000;
export const sessionExpired = (lastActivity,now=Date.now()) => now-lastActivity>=IDLE_TIMEOUT_MS;
const ITERATIONS = 210000;
const hex = bytes => Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
const unhex = value => new Uint8Array(value.match(/.{2}/g).map(x=>parseInt(x,16)));
async function derive(pin,salt){
  const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(pin),'PBKDF2',false,['deriveBits']);
  const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt,iterations:ITERATIONS,hash:'SHA-256'},key,256);
  return hex(new Uint8Array(bits));
}
export async function createVerifier(pin){
  if(!PIN_LENGTH.test(pin))throw Error('Use 6 to 12 numbers for your passcode.');
  const salt=crypto.getRandomValues(new Uint8Array(16));
  return {version:1,salt:hex(salt),digest:await derive(pin,salt)};
}
export function validVerifier(value){return value?.version===1&&/^[a-f0-9]{32}$/.test(value.salt)&&/^[a-f0-9]{64}$/.test(value.digest)}
export async function verifyPasscode(pin,verifier){
  if(!PIN_LENGTH.test(pin)||!validVerifier(verifier))return false;
  const actual=await derive(pin,unhex(verifier.salt));let difference=0;
  for(let i=0;i<actual.length;i++)difference|=actual.charCodeAt(i)^verifier.digest.charCodeAt(i);
  return difference===0;
}
export function nextFailure(previous,now=Date.now()){
  if(previous?.until>now)return previous;
  const count=(previous?.until?0:Number(previous?.count)||0)+1;
  return count>=MAX_FAILURES?{count:0,until:now+COOLDOWN_MS}:{count,until:0};
}
