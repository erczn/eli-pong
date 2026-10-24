import test from 'node:test';
import assert from 'node:assert/strict';
import {MAX_PHOTO_URL_LENGTH,MAX_SOURCE_BYTES,fitPhoto,isPhotoValue,validatePhotoSource} from '../src/services/photos.js';
test('photo fields accept safe links and capped raster images, rejecting SVG and scripts',()=>{
  for(const value of ['','/photos/eli.jpg','https://example.com/eli.jpg','data:image/jpeg;base64,/9j/AA=='])assert.equal(isPhotoValue(value),true,value);
  for(const value of ['//untrusted.example/pic','javascript:alert(1)','data:image/svg+xml;base64,PHN2Zz4=','data:text/html;base64,AA==','data:image/jpeg;base64,'+'A'.repeat(MAX_PHOTO_URL_LENGTH)])assert.equal(isPhotoValue(value),false);
});
test('source validation rejects non-photos, empty files, and oversized camera files',()=>{
  assert.doesNotThrow(()=>validatePhotoSource({type:'image/jpeg',size:100}));
  assert.doesNotThrow(()=>validatePhotoSource({type:'image/heic',size:100}));
  assert.doesNotThrow(()=>validatePhotoSource({type:'',name:'phone.JPG',size:100}));
  for(const file of [{type:'application/pdf',size:100},{type:'image/svg+xml',size:100},{type:'image/png',size:0},{type:'image/jpeg',size:MAX_SOURCE_BYTES+1}])assert.throws(()=>validatePhotoSource(file));
});
test('resize preserves portrait/landscape proportions without enlarging small images',()=>{
  assert.deepEqual(fitPhoto(4000,3000),{width:1200,height:900});
  assert.deepEqual(fitPhoto(3000,4000),{width:900,height:1200});
  assert.deepEqual(fitPhoto(320,240),{width:320,height:240});
});
