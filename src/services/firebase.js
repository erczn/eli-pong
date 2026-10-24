import {isPhotoValue} from './photos';
import { initializeApp } from 'firebase/app';
import { getFirestore,collection,onSnapshot,addDoc,serverTimestamp,doc,setDoc,deleteDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
const e=import.meta.env;
export const configured=Boolean(e.VITE_FIREBASE_PROJECT_ID && e.VITE_FIREBASE_API_KEY);
const app=configured?initializeApp({apiKey:e.VITE_FIREBASE_API_KEY,authDomain:e.VITE_FIREBASE_AUTH_DOMAIN,projectId:e.VITE_FIREBASE_PROJECT_ID,storageBucket:e.VITE_FIREBASE_STORAGE_BUCKET,messagingSenderId:e.VITE_FIREBASE_MESSAGING_SENDER_ID,appId:e.VITE_FIREBASE_APP_ID}):null;
export const db=app?getFirestore(app):null,auth=app?getAuth(app):null;
export function listen(name,success,failure){return onSnapshot(collection(db,name),s=>success(s.docs.map(d=>({id:d.id,...d.data()}))),failure)}
export async function submit(name,data){if(!db) throw Error('Demo preview: submissions are disabled until the family connects Firebase.');return addDoc(collection(db,name),{...data,createdAt:serverTimestamp()})}
export const save=(name,id,data)=>{for(const field of ['photoUrl','imageUrl'])if(field in data&&!isPhotoValue(data[field]))throw Error('Choose a smaller photo or a valid image link.');return setDoc(doc(db,name,id),data)};
export const remove=(name,id)=>deleteDoc(doc(db,name,id));
