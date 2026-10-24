export const MAX_SOURCE_BYTES=15*1024*1024;
export const MAX_PHOTO_BYTES=120*1024;
export const MAX_PHOTO_URL_LENGTH=164000;
export function validatePhotoSource(file){
  if(!file||!(/^image\/(jpeg|png|webp|avif|heic|heif)$/i.test(file.type)||(!file.type&&/\.(jpe?g|png|webp|avif|heic|heif)$/i.test(file.name||''))))throw Error('Choose a JPG, PNG, WebP, AVIF, or supported phone photo.');
  if(file.size>MAX_SOURCE_BYTES)throw Error('Choose a photo smaller than 15 MB.');
  if(!file.size)throw Error('This photo is empty. Please choose another.');
}
export function isPhotoValue(value){return !value||(/^\/(?!\/)/.test(value)&&value.length<=2000)||(/^https:\/\//i.test(value)&&value.length<=2000)||(/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/.test(value)&&value.length<=MAX_PHOTO_URL_LENGTH)}
export function fitPhoto(width,height,maxEdge=1200){const scale=Math.min(1,maxEdge/Math.max(width,height));return {width:Math.max(1,Math.round(width*scale)),height:Math.max(1,Math.round(height*scale))}}
async function decode(file){
  if(typeof createImageBitmap==='function'){try{return await createImageBitmap(file,{imageOrientation:'from-image'})}catch{}}
  const url=URL.createObjectURL(file);
  try{return await new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(Error('This phone format cannot be opened here. Export it as JPG or PNG and try again.'));image.src=url})}finally{URL.revokeObjectURL(url)}
}
export async function preparePhoto(file){
  validatePhotoSource(file);const image=await decode(file);
  try{
    const sourceWidth=image.width||image.naturalWidth,sourceHeight=image.height||image.naturalHeight;
    if(!sourceWidth||!sourceHeight||sourceWidth*sourceHeight>48000000)throw Error('Choose a photo under 48 megapixels.');
    let {width,height}=fitPhoto(sourceWidth,sourceHeight),quality=.82,blob;
    const canvas=document.createElement('canvas'),context=canvas.getContext('2d');
    if(!context)throw Error('Photo processing is unavailable in this browser.');
    for(let attempt=0;attempt<12;attempt++){
      canvas.width=width;canvas.height=height;context.fillStyle='#fffaf0';context.fillRect(0,0,width,height);context.drawImage(image,0,0,width,height);
      blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',quality));
      if(!blob)throw Error('This photo could not be compressed. Try another JPG or PNG.');
      if(blob.size<=MAX_PHOTO_BYTES)break;
      if(quality>.48)quality-=.12;else{width=Math.max(1,Math.round(width*.8));height=Math.max(1,Math.round(height*.8))}
    }
    if(blob.size>MAX_PHOTO_BYTES)throw Error('This photo is too detailed to save. Choose a smaller photo.');
    const url=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(Error('Could not read the compressed photo.'));reader.readAsDataURL(blob)});
    if(!isPhotoValue(url))throw Error('The compressed photo is too large.');
    return {url,bytes:blob.size,width,height};
  }finally{image.close?.()}
}
