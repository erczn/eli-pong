export const normalizeRole = role => String(role || '').trim().toLowerCase();
export const roleLabel = role => ({father:'Dad',mother:'Mom',baby:'Our little blessing',godfather:'Ninong',godmother:'Ninang'}[normalizeRole(role)] || 'Family');
export const appearanceRole = role => ({father:'godfather',mother:'godmother'}[normalizeRole(role)] || normalizeRole(role));
export function getFamilyProfiles(people,event){
  return ['father','baby','mother'].map(role=>{
    const found=people.find(p=>normalizeRole(p.role)===role);
    const defaults=role==='baby'?{id:'eli',role:'baby',name:event.babyName,photoUrl:'/baby-eli.svg',message:'Tiny hands, big dreams, and so much love. Thank you for being part of my beautiful beginning!'}
      :role==='father'?{id:'richmond',role:'father',name:'Dada Richmond',photoUrl:'/portrait-mark.svg',message:'Every day with you is a blessing, Eli. We are so happy to celebrate this special day with everyone we love.'}
      :{id:'mae',role:'mother',name:'Mama Mae',photoUrl:'/portrait-anna.svg',message:'Our little girl, our greatest joy. Thank you for surrounding Eli with so much love.'};
    return {...defaults,...found,role};
  });
}
