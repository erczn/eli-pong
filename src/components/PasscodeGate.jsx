import React,{useCallback,useEffect,useRef,useState} from 'react';
import {Link} from 'react-router-dom';
import {EmailAuthProvider,reauthenticateWithCredential} from 'firebase/auth';
import {auth} from '../services/firebase';
import {createVerifier,validVerifier,verifyPasscode,nextFailure,sessionExpired,MAX_FAILURES} from '../services/dashboardPasscode';

export default function PasscodeGate({identity,demo,children}){
  const key=`eli-parent-passcode:${identity}`,attemptKey=`${key}:attempts`;
  const [verifier,setVerifier]=useState(()=>{try{const value=JSON.parse(localStorage.getItem(key));return validVerifier(value)?value:null}catch{return null}});
  const [attempts,setAttempts]=useState(()=>{try{return JSON.parse(localStorage.getItem(attemptKey))||{count:0,until:0}}catch{return {count:0,until:0}}});
  const [unlocked,setUnlocked]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[now,setNow]=useState(Date.now()),[recover,setRecover]=useState(false);
  const lastActivity=useRef(Date.now()),busyRef=useRef(false);
  const lock=useCallback(()=>{setUnlocked(false);setRecover(false);setError('Dashboard locked. Enter your passcode to continue.');},[]);
  useEffect(()=>{if(!unlocked)return;const activity=()=>{if(sessionExpired(lastActivity.current))lock();else lastActivity.current=Date.now()};const check=()=>{if(sessionExpired(lastActivity.current))lock()};const events=['pointerdown','keydown','scroll','touchstart'];events.forEach(e=>window.addEventListener(e,activity,{passive:true}));window.addEventListener('focus',check);document.addEventListener('visibilitychange',check);const timer=setInterval(check,1000);return()=>{events.forEach(e=>window.removeEventListener(e,activity));window.removeEventListener('focus',check);document.removeEventListener('visibilitychange',check);clearInterval(timer)}},[unlocked,lock]);
  useEffect(()=>{if(!attempts.until)return;const timer=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(timer)},[attempts.until]);
  useEffect(()=>{function changed(e){if(e.key===null||e.key===key){setUnlocked(false);try{const v=JSON.parse(e.newValue);setVerifier(validVerifier(v)?v:null)}catch{setVerifier(null)}}if(e.key===attemptKey){try{setAttempts(JSON.parse(e.newValue)||{count:0,until:0})}catch{setAttempts({count:0,until:0})}}}window.addEventListener('storage',changed);return()=>window.removeEventListener('storage',changed)},[key,attemptKey]);
  const remaining=Math.max(0,Math.ceil(((attempts.until||0)-now)/1000));
  async function submit(e){
    e.preventDefault();if(busyRef.current||attempts.until>Date.now())return;
    const form=e.currentTarget,f=new FormData(form),pin=f.get('pin');setError('');
    if(!verifier&&pin!==f.get('confirmPin')){setError('The passcodes do not match. Please try again.');return}
    busyRef.current=true;setBusy(true);
    try{
      if(!verifier){const v=await createVerifier(pin);localStorage.setItem(key,JSON.stringify(v));setVerifier(v)}
      else if(!await verifyPasscode(pin,verifier)){
        const failure=nextFailure(attempts);localStorage.setItem(attemptKey,JSON.stringify(failure));setAttempts(failure);setNow(Date.now());form.reset();setError(failure.until?'Too many incorrect attempts. Try again in one minute.':`Incorrect passcode. ${MAX_FAILURES-failure.count} attempts left before a one-minute pause.`);return;
      }
      localStorage.removeItem(attemptKey);setAttempts({count:0,until:0});lastActivity.current=Date.now();form.reset();setUnlocked(true);
    }catch{setError('Unable to open the dashboard. Use a browser with secure storage and HTTPS (or localhost).')}
    finally{busyRef.current=false;setBusy(false)}
  }
  async function reset(e){e.preventDefault();setBusy(true);setError('');try{const password=new FormData(e.currentTarget).get('accountPassword');const user=auth.currentUser;await reauthenticateWithCredential(user,EmailAuthProvider.credential(user.email,password));localStorage.removeItem(key);localStorage.removeItem(attemptKey);setVerifier(null);setAttempts({count:0,until:0});setRecover(false)}catch{setError('Account verification failed. Your passcode has not changed.')}finally{setBusy(false)}}
  if(unlocked)return children(lock);
  return <main className="parent-login"><Link to="/">← Back to invitation</Link><div className="parent-login-card passcode-card"><span className="passcode-lock" aria-hidden="true"><svg viewBox="0 0 32 36" width="30" height="34" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M8 16V10a8 8 0 0 1 16 0v6"/><rect x="3" y="15" width="26" height="19" rx="5"/><circle cx="16" cy="23" r="2"/><path d="M16 25v3"/></svg></span><p className="eyebrow">FOR MOM & DAD ONLY</p><h1>{recover?'Reset your passcode':verifier?'Your family’s little space.':'Create your parent passcode.'}</h1><p>{recover?'Confirm your Firebase account password before changing this browser’s passcode.':verifier?'Enter your passcode to open the parent dashboard.':'Choose a private code with 6–12 numbers. You’ll use it to unlock the dashboard on this browser.'}</p>
    {recover?<form onSubmit={reset}><label>Parent account password<input type="password" name="accountPassword" autoComplete="current-password" required autoFocus/></label><button className="button" disabled={busy}>{busy?'Verifying…':'Verify account & reset'}</button><button type="button" className="quiet-button" onClick={()=>{setRecover(false);setError('')}}>Back to passcode</button></form>:<form onSubmit={submit}>
      <label>Parent passcode<input key={verifier?'unlock':'setup'} autoFocus className="passcode-input" type="password" inputMode="numeric" name="pin" pattern="[0-9]{6,12}" minLength="6" maxLength="12" required autoComplete={verifier?'current-password':'new-password'} aria-describedby="passcode-help" disabled={busy||remaining>0}/></label>
      {!verifier&&<label>Confirm passcode<input className="passcode-input" type="password" inputMode="numeric" name="confirmPin" pattern="[0-9]{6,12}" minLength="6" maxLength="12" required autoComplete="new-password" disabled={busy}/></label>}
      <small id="passcode-help">{remaining>0?`Please wait ${remaining} seconds before trying again.`:'6–12 numbers · Automatically locks after 10 minutes of inactivity'}</small>
      <button className="button" disabled={busy||remaining>0}>{busy?'Checking…':verifier?'Unlock dashboard ↗':'Save passcode & continue ↗'}</button>
      {!demo&&verifier&&<button type="button" className="quiet-button" onClick={()=>{setRecover(true);setError('')}}>Forgot passcode? Verify parent account</button>}
    </form>}
    <p className="status" role="alert">{error}</p><div className="passcode-note">{demo?'Local preview lock: protects casual access on this browser. Firebase account permissions are required to protect real guest data online.':'This browser lock is additional to your Firebase parent-account permissions. It is not a replacement for account authentication.'}</div>
  </div></main>;
}
