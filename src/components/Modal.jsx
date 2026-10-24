import React,{useEffect,useRef} from 'react';
export default function Modal({children,onClose}){
 const ref=useRef();
 useEffect(()=>{const previous=document.activeElement;ref.current.showModal();return()=>previous?.focus()},[]);
 return <dialog ref={ref} aria-label="Invitation detail" onCancel={onClose} onClick={e=>{if(e.target===e.currentTarget)onClose()}}><button className="close" onClick={onClose} aria-label="Close dialog">×</button>{children}</dialog>;
}
