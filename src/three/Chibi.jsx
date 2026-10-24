import React,{useEffect,useMemo} from 'react';
import {QuadraticBezierCurve3,Vector2,Vector3,SphereGeometry,Float32BufferAttribute,Color,LatheGeometry} from 'three';

function Ball({position,scale=1,color,rotation,gloss=false}){
  return <mesh position={position} scale={scale} rotation={rotation} castShadow><sphereGeometry args={[1,32,28]}/><meshPhysicalMaterial color={color} roughness={gloss?.19:.55} clearcoat={gloss?.8:.08} clearcoatRoughness={.2}/></mesh>;
}
function Limb({position,color,rotation}){
  return <mesh position={position} rotation={rotation} castShadow><capsuleGeometry args={[.105,.17,8,16]}/><meshStandardMaterial color={color} roughness={.65}/></mesh>;
}
function Flower({position,color}){
  return <group position={position}>{[0,1,2,3,4].map(i=><Ball key={i} position={[Math.cos(i*Math.PI*2/5)*.065,Math.sin(i*Math.PI*2/5)*.065,0]} scale={[.055,.055,.025]} color="#fff5df"/>)}<Ball position={[0,0,.025]} scale={.035} color={color}/></group>;
}
function Curve({points,color,radius=.012}){
  const curve=useMemo(()=>new QuadraticBezierCurve3(...points.map(p=>new Vector3(...p))),[JSON.stringify(points)]);
  return <mesh><tubeGeometry args={[curve,24,radius,8,false]}/><meshStandardMaterial color={color} roughness={.65}/></mesh>;
}
function Face({skin}){
  const geometry=useMemo(()=>{
    const g=new SphereGeometry(1,48,40),p=g.attributes.position,colors=[];
    const base=new Color(skin),blush=new Color('#ec8799');
    for(let i=0;i<p.count;i++){
      const x=p.getX(i),y=p.getY(i),z=p.getZ(i);
      p.setX(i,x*(1-.12*Math.max(0,-y)));
      const rosy=z>0?Math.exp(-((Math.abs(x)-.6)**2/.055+(y+.24)**2/.04))*Math.min(1,z*2)*.44:0;
      const tone=base.clone().lerp(blush,rosy);colors.push(tone.r,tone.g,tone.b);
    }
    g.setAttribute('color',new Float32BufferAttribute(colors,3));g.computeVertexNormals();return g;
  },[skin]);
  useEffect(()=>()=>geometry.dispose(),[geometry]);
  return <mesh geometry={geometry} position={[0,1.59,0]} scale={[.64,.63,.55]} castShadow><meshPhysicalMaterial vertexColors roughness={.52} clearcoat={.06} sheen={.18} sheenColor="#ffe0d1"/></mesh>;
}
function Dress({color,baby}){
  const geometry=useMemo(()=>{
    const g=new LatheGeometry([[.44,.24],[.45,.28],[.41,.38],[.34,.53],[.27,.67],[.235,.75]].map(([r,y])=>new Vector2(r,y)),64);
    const p=g.attributes.position;
    for(let i=0;i<p.count;i++){
      const x=p.getX(i),z=p.getZ(i),y=p.getY(i),angle=Math.atan2(z,x);
      const pleat=1+Math.cos(angle*14)*.025*Math.max(0,(.75-y)/.5);
      p.setXYZ(i,x*pleat,y,z*pleat);
    }
    g.computeVertexNormals();return g;
  },[]);
  useEffect(()=>()=>geometry.dispose(),[geometry]);
  return <>
    <mesh geometry={geometry} castShadow><meshPhysicalMaterial color={color} roughness={.85} sheen={.7} sheenColor="#fff5ee" side={2}/></mesh>
    <Ball position={[0,.84,0]} scale={[.27,.24,.235]} color={color}/>
    {Array.from({length:22},(_,i)=>{const a=i*Math.PI*2/22;return <Ball key={i} position={[Math.sin(a)*.44,.255,Math.cos(a)*.44]} scale={[.032,.035,.025]} color={baby?'#fffaf3':'#f6c7d7'}/>})}
    <Ball position={[0,.73,.24]} scale={[.245,.027,.032]} color={baby?'#efb5c9':'#fff0e7'}/>
    {[-1,1].map(s=><Ball key={s} position={[s*.075,.73,.278]} scale={[.085,.052,.027]} color={baby?'#efb5c9':'#fff0e7'} rotation={[0,0,s*.25]}/>)}
    <Ball position={[0,.73,.302]} scale={.035} color={baby?'#eaa2bc':'#fff6e8'}/>
    {[-.13,-.065,0,.065,.13].map((x,i)=><Ball key={i} position={[x,1.005-Math.abs(x)*.27,.205]} scale={.021} color="#fffdf6"/>)}
  </>;
}
export default function Chibi({role,c,arm}){
  const baby=role==='baby',mother=role==='godmother';
  const smile=useMemo(()=>new QuadraticBezierCurve3(new Vector3(-.075,1.365,.528),new Vector3(0,1.29,.55),new Vector3(.075,1.365,.528)),[]);
  return <>
    {/* Oversized heads, tiny torsos, and stubby limbs form the chibi silhouette. */}
    {c.hairStyle==='long'&&<Ball position={[0,1.53,-.25]} scale={[.655,.71,.32]} color={c.hair}/>}
    <Face skin={c.skin}/>
    {[-1,1].map(s=><group key={s}>
      <Ball position={[s*.625,1.51,0]} scale={[.1,.13,.085]} color={c.skin}/>
      <Ball position={[s*.218,1.585,.505]} scale={[.108,.138,.06]} color="#fff8ee"/>
      <Ball position={[s*.218,1.58,.55]} scale={[.081,.111,.039]} color="#624433" gloss/>
      <Ball position={[s*.218,1.585,.579]} scale={[.048,.079,.021]} color="#251f24" gloss/>
      <Ball position={[s*.218-.022,1.628,.598]} scale={[.023,.029,.009]} color="#fffdf7"/>
      <Ball position={[s*.218+.022,1.553,.594]} scale={[.011,.013,.006]} color="#fffdf7"/>
      <Curve points={[[s*.218-.11,1.722,.493],[s*.218,1.763,.51],[s*.218+.105,1.722,.493]]} color={c.hair} radius={baby?.009:.012}/>
      {(baby||mother)&&<Curve points={[[s*.218-.104,1.64,.542],[s*.218,1.755,.556],[s*.218+.104,1.64,.542]]} color="#604136" radius={.009}/>}
      <Limb position={[s*.15,.23,0]} color={baby?c.skin:c.outfit}/>
      <Ball position={[s*.15,.075,.065]} scale={[.145,.085,.19]} color={baby?'#fff9eb':c.outfit}/>
    </group>)}
    <Ball position={[0,1.465,.539]} scale={[.053,.065,.045]} color={c.skin}/>
    <Ball position={[0,1.425,.56]} scale={[.06,.038,.034]} color={c.skin}/>
    <mesh><tubeGeometry args={[smile,20,.012,8,false]}/><meshStandardMaterial color="#995d58"/></mesh>
    {baby?<>
      <mesh position={[0,1.62,-.025]} scale={[.648,.63,.55]} castShadow><sphereGeometry args={[1,32,24,0,Math.PI*2,0,.9]}/><meshStandardMaterial color={c.hair} roughness={.8}/></mesh>
      <Ball position={[-.08,2.135,.11]} scale={[.19,.083,.12]} color={c.hair} rotation={[0,0,.35]}/>
      <Ball position={[.09,2.16,.08]} scale={[.12,.07,.1]} color={c.hair} rotation={[0,0,-.4]}/>
      <Ball position={[-.22,2.045,.31]} scale={[.25,.105,.095]} color={c.hair} rotation={[0,0,.3]}/>
      <Curve points={[[-.54,1.94,.26],[0,2.42,.22],[.54,1.94,.26]]} color={c.accessory} radius={.028}/>
      <group position={[.37,2.075,.41]} rotation={[0,0,-.25]}>
        {[-1,1].map(s=><Ball key={s} position={[s*.09,0,0]} scale={[.115,.075,.035]} color={c.accessory} rotation={[0,0,s*.3]}/>)}
        <Flower position={[0,0,.035]} color="#e8c36f"/>
      </group>
    </>:<>
      <mesh position={[0,1.62,-.015]} scale={[.65,.64,.56]} castShadow><sphereGeometry args={[1,32,24,0,Math.PI*2,0,1.15]}/><meshStandardMaterial color={c.hair} roughness={.75}/></mesh>
      <Ball position={[-.24,2.015,.3]} scale={[.36,.17,.15]} color={c.hair} rotation={[0,0,.25]}/>
      <Ball position={[.24,2.04,.26]} scale={[.29,.15,.16]} color={c.hair} rotation={[0,0,-.25]}/>
      {[-1,1].map(s=><Curve key={s} points={[[s*.1,2.16,.3],[s*.3,2.11,.405],[s*.48,1.99,.29]]} color={mother?'#86543c':'#674735'} radius={.007}/>)}
    </>}
    {(mother||baby)?<>
      <Dress color={c.outfit} baby={baby}/>
      {mother&&[-.3,0,.3].map((x,i)=><Flower key={i} position={[x,2.13-Math.abs(x)*.25,.46]} color={c.accessory}/>)}
    </>:<>
      <Ball position={[0,.68,0]} scale={[.31,.39,.255]} color={c.outfit}/>
      <Ball position={[0,.92,.235]} scale={[.12,.13,.045]} color="#fffaf0"/>
      {[-1,1].map(s=><Ball key={s} position={[s*.135,.86,.223]} scale={[.075,.18,.037]} color="#63968f" rotation={[0,0,s*.4]}/>)}
      {[-1,1].map(s=><Ball key={s} position={[s*.08,.99,.288]} scale={[.09,.055,.025]} color={c.accessory} rotation={[0,0,s*.25]}/>)}
      <Ball position={[0,.99,.315]} scale={.035} color={c.accessory}/>
      {[.74,.61].map(y=><Ball key={y} position={[0,y,.257]} scale={.023} color={baby?c.accessory:'#fff3d9'}/>)}
    </>}
    <group ref={arm} position={[.34,.96,0]}><Limb position={[.075,-.15,0]} color={c.outfit}/>{(baby||mother)&&<Ball position={[.06,-.07,0]} scale={[.135,.13,.13]} color={c.outfit}/>}<Ball position={[.075,-.325,0]} scale={[.1,.115,.08]} color={c.skin}/><Ball position={[.015,-.31,.06]} scale={[.043,.065,.04]} color={c.skin}/></group>
    <Limb position={[-.415,.79,0]} color={c.outfit} rotation={[0,0,-.2]}/>
    <Ball position={[-.45,.605,0]} scale={[.11,.115,.105]} color={c.skin}/>
  </>;
}
