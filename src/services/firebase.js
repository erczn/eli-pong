import { initializeApp } from 'firebase/app';
import { getFirestore,collection,onSnapshot,addDoc,serverTimestamp,doc,setDoc,deleteDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage,ref,uploadBytes,getDownloadURL } from 'firebase/storage';
const e=import.meta.env;
export const configured=Boolean(e.VITE_FIREBASE_PROJECT_ID && e.VITE_FIREBASE_API_KEY);
const app=configured?initializeApp({apiKey:e.VITE_FIREBASE_API_KEY,authDomain:e.VITE_FIREBASE_AUTH_DOMAIN,projectId:e.VITE_FIREBASE_PROJECT_ID,storageBucket:e.VITE_FIREBASE_STORAGE_BUCKET,messagingSenderId:e.VITE_FIREBASE_MESSAGING_SENDER_ID,appId:e.VITE_FIREBASE_APP_ID}):null;
export const db=app?getFirestore(app):null,auth=app?getAuth(app):null,storage=app?getStorage(app):null;
export function listen(name,success,failure){return onSnapshot(collection(db,name),s=>success(s.docs.map(d=>({id:d.id,...d.data()}))),failure)}
export async function submit(name,data){if(!db) throw Error('Demo preview: submissions are disabled until the family connects Firebase.');return addDoc(collection(db,name),{...data,createdAt:serverTimestamp()})}
export const save=(name,id,data)=>setDoc(doc(db,name,id),data);
export const remove=(name,id)=>deleteDoc(doc(db,name,id));
export async function uploadImage(file){if(!file.type.startsWith('image/'))throw Error('Choose an image.');if(file.size>15*1024*1024)throw Error('Choose an image under 15 MB.');const bitmap=await createImageBitmap(file);const scale=Math.min(1,1600/Math.max(bitmap.width,bitmap.height));const canvas=document.createElement('canvas');canvas.width=bitmap.width*scale;canvas.height=bitmap.height*scale;canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();const blob=await new Promise(r=>canvas.toBlob(r,'image/webp',.8));if(!blob)throw Error('Image could not be compressed.');const target=ref(storage,`gallery/${crypto.randomUUID()}.webp`);await uploadBytes(target,blob,{contentType:'image/webp'});return getDownloadURL(target)}
