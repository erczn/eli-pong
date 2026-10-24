import {initializeApp,applicationDefault} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
if(!process.argv[2]||!process.env.GOOGLE_CLOUD_PROJECT)throw Error('Usage: node --env-file=.env scripts/set-admin.js parent@example.com');
initializeApp({credential:applicationDefault(),projectId:process.env.GOOGLE_CLOUD_PROJECT});
const auth=getAuth();const user=await auth.getUserByEmail(process.argv[2]);await auth.setCustomUserClaims(user.uid,{...user.customClaims,admin:true});console.log('Parent admin access granted. Sign out and back in.');
