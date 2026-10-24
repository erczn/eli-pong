const PREFIX='eli-invitation-demo:';
export function readDemo(name,fallback=[]){
  try {const data=JSON.parse(localStorage.getItem(PREFIX+name));return Array.isArray(data)?data:fallback;}catch{return fallback;}
}
export function writeDemo(name,id,data,fallback=[]){
  const rows=readDemo(name,fallback),next=rows.filter(r=>r.id!==id);
  if(data!==null)next.push({...data,id});
  localStorage.setItem(PREFIX+name,JSON.stringify(next));
  window.dispatchEvent(new CustomEvent('eli-demo-change',{detail:name}));
}
