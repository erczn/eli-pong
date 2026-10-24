import {initializeApp,applicationDefault} from 'firebase-admin/app';
import {getFirestore} from 'firebase-admin/firestore';
import {event,godparents,schedule,gallery} from '../src/data.js';
if(!process.env.GOOGLE_CLOUD_PROJECT)throw Error('Set GOOGLE_CLOUD_PROJECT before seeding.');
initializeApp({credential:applicationDefault(),projectId:process.env.GOOGLE_CLOUD_PROJECT});
const db=getFirestore();
for(const [name,rows] of Object.entries({event:[{id:'main',...event}],godparents,schedule,gallery}))for(const row of rows){const {id,...data}=row;const target=db.collection(name).doc(id);if((await target.get()).exists){console.log(`Kept existing ${name}/${id}`);continue}await target.create(data);console.log(`Created ${name}/${id}`)}
