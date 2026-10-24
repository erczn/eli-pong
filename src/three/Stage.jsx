import React,{useMemo} from 'react';
import {CatmullRomCurve3,Shape,Vector3} from 'three';
function Puff({position,scale=1,color='#fffaf2'}){return <mesh position={position} scale={scale} castShadow><sphereGeometry args={[1,24,16]}/><meshStandardMaterial color={color} roughness={.9}/></mesh>}
function Cloud({position,scale=1}){return <group position={position} scale={scale}>{[[-.32,0,.25],[0,.12,.34],[.32,.02,.26]].map(([x,y,s],i)=><Puff key={i} position={[x,y,0]} scale={[s,s*.75,s*.5]}/>)}</group>}
function Rainbow({radius,color}){const curve=useMemo(()=>new CatmullRomCurve3(Array.from({length:33},(_,i)=>{const a=i*Math.PI/32;return new Vector3(Math.cos(a)*radius,Math.sin(a)*radius+.82,-1.07)})),[radius]);return <mesh><tubeGeometry args={[curve,64,.073,10,false]}/><meshStandardMaterial color={color} roughness={.85}/></mesh>}
function Star({position,scale=.16,color='#e6bf6d'}){const shape=useMemo(()=>{const s=new Shape();for(let i=0;i<10;i++){const a=i*Math.PI/5+Math.PI/2,r=i%2?.45:1;i?s.lineTo(Math.cos(a)*r,Math.sin(a)*r):s.moveTo(Math.cos(a)*r,Math.sin(a)*r)}s.closePath();return s},[]);return <mesh position={position} scale={scale} rotation={[0,0,.15]}><extrudeGeometry args={[shape,{depth:.12,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.035,bevelThickness:.025}]}/><meshStandardMaterial color={color} roughness={.6}/></mesh>}
function Balloon({position,color}){const string=useMemo(()=>new CatmullRomCurve3([new Vector3(0,-.25,0),new Vector3(.04,-.75,0),new Vector3(-.03,-1.1,0)]),[]);return <group position={position}><Puff position={[0,0,0]} scale={[.21,.27,.19]} color={color}/><mesh><tubeGeometry args={[string,20,.009,6,false]}/><meshStandardMaterial color="#a1b39b"/></mesh></group>}
export default function Stage(){const arch=useMemo(()=>{const s=new Shape();s.moveTo(-2.75,-.28);s.lineTo(2.75,-.28);s.lineTo(2.75,.9);s.absarc(0,.9,2.75,0,Math.PI,false);s.lineTo(-2.75,-.28);s.closePath();return s},[]);return <group>
  <mesh position={[0,0,-1.25]}><shapeGeometry args={[arch]}/><meshBasicMaterial color="#e0ead9"/></mesh>
  {['#edc0ca','#f3d899','#c1d7cc'].map((color,i)=><Rainbow key={color} radius={2.18-i*.17} color={color}/>)}
  <Cloud position={[-1.95,2.65,-.8]} scale={.85}/><Cloud position={[1.95,2.48,-.8]} scale={.72}/>
  <Star position={[-1.35,3.15,-.8]} scale={.15}/><Star position={[1.05,3.24,-.8]} scale={.12} color="#eab2c4"/><Star position={[2.25,2.95,-.9]} scale={.1}/>
  <Balloon position={[-2.2,1.55,-.35]} color="#dfadc0"/><Balloon position={[2.2,1.4,-.4]} color="#d8c380"/>
  <mesh position={[0,-.115,0]} receiveShadow castShadow><cylinderGeometry args={[2.55,2.65,.23,80]}/><meshStandardMaterial color="#fff4dc" roughness={.78}/></mesh>
  <mesh position={[0,-.245,0]} receiveShadow castShadow><cylinderGeometry args={[2.66,2.66,.03,80]}/><meshStandardMaterial color="#cfb478" metalness={.12} roughness={.5}/></mesh>
  <mesh position={[0,-.31,0]} receiveShadow castShadow><cylinderGeometry args={[2.68,2.77,.1,80]}/><meshStandardMaterial color="#d6e2cd" roughness={.8}/></mesh>
  <mesh rotation={[-Math.PI/2,0,0]} position={[0,.002,0]} receiveShadow><circleGeometry args={[2.3,64]}/><meshStandardMaterial color="#f2e9d7" roughness={1}/></mesh>
  <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.37,0]}><circleGeometry args={[3.3,64]}/><meshBasicMaterial color="#edf2e7"/></mesh>
</group>}
