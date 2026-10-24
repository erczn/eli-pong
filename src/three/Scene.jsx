import React,{Component,Suspense,useEffect,useRef,useState,useMemo} from 'react';
import {Shape} from 'three';
import {Canvas,useFrame} from '@react-three/fiber';
import {ContactShadows,OrbitControls,useGLTF,useAnimations} from '@react-three/drei';
import Chibi from './Chibi';
import Stage from './Stage';
import {characterConfig} from './characterConfig';
import {appearanceRole,normalizeRole} from '../services/profiles';
class ModelBoundary extends Component{state={failed:false};static getDerivedStateFromError(){return{failed:true}}componentDidCatch(){this.props.onError()}render(){return this.state.failed?null:this.props.children}}
function StarBurst({x,color,reduced}){const mesh=useRef();const shape=useMemo(()=>{const s=new Shape();for(let i=0;i<10;i++){const a=i*Math.PI/5+Math.PI/2,r=i%2?.45:1;i?s.lineTo(Math.cos(a)*r,Math.sin(a)*r):s.moveTo(Math.cos(a)*r,Math.sin(a)*r)}s.closePath();return s},[]);useFrame((_,delta)=>{if(!mesh.current||reduced)return;mesh.current.position.y+=delta*.35;mesh.current.rotation.z+=delta*.4});return <mesh ref={mesh} position={[x*.32,2.35+Math.abs(x)*.16,.45]} scale={.12}><shapeGeometry args={[shape]}/><meshBasicMaterial color={color} side={2}/></mesh>}
function Model({path,reduced}){const {scene,animations}=useGLTF(path);const {actions}=useAnimations(animations,scene);useEffect(()=>{if(!reduced)Object.values(actions).forEach(a=>a?.play());return()=>Object.values(actions).forEach(a=>a?.stop())},[actions,reduced]);return <primitive object={scene} scale={.8}/>}
function Character({person,x,onSelect,reduced}){
 const root=useRef(),arm=useRef();const [wave,setWave]=useState(0),[burst,setBurst]=useState(0),[path,setPath]=useState(null);
 const role=appearanceRole(person.role),baby=role==='baby',baseScale=baby?.8:1;
 const config={...characterConfig[role],...person.characterConfig};
 useEffect(()=>{if(!burst)return;const timer=setTimeout(()=>setBurst(0),1300);return()=>clearTimeout(timer)},[burst]);
 useEffect(()=>{let live=true;setPath(null);const url=person.modelPath||`/models/${role}.glb`;fetch(url).then(async r=>{if(!r.ok)return;const bytes=new Uint8Array(await r.arrayBuffer());if(live&&bytes[0]===103&&bytes[1]===108&&bytes[2]===84&&bytes[3]===70)setPath(url)}).catch(()=>{});return()=>{live=false}},[role,person.modelPath]);
 useFrame(({clock})=>{if(!root.current)return;const t=clock.elapsedTime;root.current.scale.y=baseScale*(reduced?1:1+Math.sin(t*1.5+x)*.003);if(arm.current)arm.current.rotation.z=wave>Date.now()&&!reduced?1.6+Math.sin(t*10)*.22:.13});
 return <group ref={root} position={[x,.012,baby?.38:0]} scale={baseScale} onPointerOver={()=>setWave(Date.now()+1800)} onClick={e=>{e.stopPropagation();setWave(Date.now()+2000);setBurst(Date.now()+1300);onSelect(person)}}>
 {path?<ModelBoundary onError={()=>setPath(null)}><Suspense fallback={<Chibi role={role} c={config} arm={arm}/>}><Model path={path} reduced={reduced}/></Suspense></ModelBoundary>:<Chibi role={role} c={config} arm={arm}/>}
 {burst>Date.now()&&[-1,0,1].map(i=><StarBurst key={i} x={i} reduced={reduced} color={i?'#f0c66b':'#e5a6bd'}/>)}
 </group>;
}
export default function Scene({onSelect,profiles=[]}){
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 return <Canvas shadows camera={{position:[0,2.7,8.8],fov:40}} dpr={[1,1.5]} aria-label="Eli with her mom and dad on a rainbow nursery stage. Tap each family member to meet them.">
 <color attach="background" args={['#edf2e7']}/><ambientLight intensity={.7}/><hemisphereLight args={['#fff5e8','#b6c6b0',1.1]}/>
 <directionalLight position={[3,6,5]} intensity={2.8} color="#fff3e5" castShadow shadow-mapSize={[1024,1024]} shadow-bias={-.0005}/><directionalLight position={[-4,3,4]} intensity={1} color="#e7f0ff"/><directionalLight position={[1,4,-3]} intensity={1.5} color="#fff0dc"/>
 <Stage/>{profiles.map((person,i)=><Character key={person.id||normalizeRole(person.role)} person={person} x={(i-1)*1.3} onSelect={onSelect} reduced={reduced}/>)}
 <ContactShadows position={[0,-.365,0]} opacity={.25} scale={9} blur={2.8}/><OrbitControls enableZoom={false} enablePan={false} minPolarAngle={1.39} maxPolarAngle={1.39} minAzimuthAngle={-.35} maxAzimuthAngle={.35} target={[0,1.25,0]}/>
 </Canvas>;
}
