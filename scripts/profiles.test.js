import test from 'node:test';
import assert from 'node:assert/strict';
import {getFamilyProfiles,normalizeRole,roleLabel,appearanceRole} from '../src/services/profiles.js';
import {readDemo,writeDemo} from '../src/services/demoStore.js';

test('legacy parent roles normalize without confusing parents with sponsors',()=>{
  assert.equal(normalizeRole('Father'),'father');
  assert.equal(normalizeRole(' Father '),'father');
  assert.equal(appearanceRole('Mother'),'godmother');
  assert.equal(roleLabel('godfather'),'Ninong');
  assert.equal(roleLabel('godmother'),'Ninang');
  const family=getFamilyProfiles([{id:'sponsor',role:'godfather',name:'A sponsor'},{id:'dad',role:'Father',name:'Dada Richmond',message:'Dad’s own message'}],{babyName:'Eli'});
  assert.deepEqual(family.map(p=>p.role),['father','baby','mother']);
  assert.equal(family[0].id,'dad');
  assert.equal(family[0].message,'Dad’s own message');
  assert.equal(family[1].name,'Eli');
  assert.ok(!family.some(p=>p.id==='sponsor'));
});
test('editing a baby profile preserves its photo, message, and character config',()=>{
  const baby={id:'eli',role:'baby',name:'Eli',photoUrl:'/photos/eli.webp',message:'Hello family!',characterConfig:{outfit:'#ffffff'}};
  assert.deepEqual(getFamilyProfiles([baby],{babyName:'Eli'})[1],baby);
});
test('local demo additions, updates, and removal preserve all other profiles',()=>{
  const memory=new Map();globalThis.localStorage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,v)};globalThis.window=new EventTarget();
  const fallback=[{id:'dad',name:'Dad'},{id:'ninang',name:'Ninang'}];let changes=0;
  window.addEventListener('eli-demo-change',()=>changes++);
  writeDemo('godparents','new',{name:'New Ninong'},fallback);
  assert.equal(readDemo('godparents').length,3);
  writeDemo('godparents','new',{name:'Edited Ninong'},fallback);
  assert.equal(readDemo('godparents').length,3);
  assert.equal(readDemo('godparents').find(p=>p.id==='new').name,'Edited Ninong');
  writeDemo('godparents','new',null,fallback);
  assert.deepEqual(readDemo('godparents'),fallback);
  assert.equal(changes,3);
  assert.equal(fallback.length,2);
  assert.deepEqual(readDemo('rsvps',[]),[]);
  memory.set('eli-invitation-demo:wishes','invalid json');
  assert.deepEqual(readDemo('wishes',[]),[]);
});
