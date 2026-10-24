import { useEffect,useState } from 'react';
import { configured,listen } from '../services/firebase';
export function useCollection(name,fallback=[]){const [data,setData]=useState(fallback),[loading,setLoading]=useState(configured),[error,setError]=useState('');useEffect(()=>{if(!configured)return;return listen(name,rows=>{setData(rows);setLoading(false);setError('')},()=>{setError(`Unable to load ${name}. Please try again later.`);setLoading(false)})},[name]);return {data,loading,error}}
