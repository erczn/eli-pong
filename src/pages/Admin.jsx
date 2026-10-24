import React,{useState,useEffect} from 'react';
import {Link} from 'react-router-dom';
import {signInWithEmailAndPassword,onAuthStateChanged,signOut,getIdTokenResult} from 'firebase/auth';
import {auth,configured} from '../services/firebase';
import AdminDashboard from './AdminDashboard';
import PasscodeGate from '../components/PasscodeGate';
export default function Admin(){
 const [user,setUser]=useState(null),[allowed,setAllowed]=useState(false),[status,setStatus]=useState(''),[loading,setLoading]=useState(configured),[busy,setBusy]=useState(false);
 useEffect(()=>{if(!auth)return;let current=0;const unsubscribe=onAuthStateChanged(auth,async u=>{const revision=++current;setLoading(true);setAllowed(false);setUser(u);try{const permitted=u?Boolean((await getIdTokenResult(u,true)).claims.admin):false;if(revision===current)setAllowed(permitted)}catch{if(revision===current)setStatus('Unable to verify access. Please sign in again.')}finally{if(revision===current)setLoading(false)}});return()=>{current++;unsubscribe()}},[]);
 async function login(e){e.preventDefault();const f=new FormData(e.currentTarget);setBusy(true);setStatus('');try{await signInWithEmailAndPassword(auth,f.get('email'),f.get('password'))}catch{setStatus('Sign-in failed. Check your email and password.')}finally{setBusy(false)}}
 if(!configured)return <PasscodeGate key="demo" identity="demo" demo>{lock=><AdminDashboard demo onLock={lock}/>}</PasscodeGate>;
 if(!loading&&user&&allowed)return <PasscodeGate key={user.uid} identity={user.uid} demo={false}>{lock=><AdminDashboard demo={false} onLock={lock}/>}</PasscodeGate>;
 return <main className="parent-login"><Link to="/">← Back to invitation</Link><div className="parent-login-card"><span className="login-heart">♡</span><p className="eyebrow">A LITTLE SPACE FOR THE FAMILY</p><h1>Welcome, Mom & Dad.</h1><p>Manage your loving village, read little wishes, and get everything ready for Eli’s day.</p>{loading?<p role="status">Checking your parent access…</p>:user?<><p>This account does not have parent access. Ask the project owner to grant the admin claim.</p><button className="button" onClick={()=>signOut(auth)}>Use another account</button></>:<form onSubmit={login}><label>Email<input type="email" name="email" required autoComplete="username"/></label><label>Password<input type="password" name="password" required autoComplete="current-password"/></label><button className="button" disabled={busy}>{busy?'Signing in…':'Open parent dashboard ↗'}</button></form>}<p role="alert" className="status">{status}</p></div></main>;
}
