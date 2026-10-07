import { useState,useEffect } from 'react';
import type { InferSelectModel } from 'drizzle-orm';
import type { products } from '../../api/database/schema';
export type Product=InferSelectModel<typeof products>;
export type CartItem={id:number;size:string;qty:number};
export const money=(n:number)=>new Intl.NumberFormat('pt-AO').format(n)+' Kz';
export const whatsapp='https://wa.me/244973560521';
export function useSaved<T>(key:string,initial:T){
 const [value,setValue]=useState<T>(()=>{try{return JSON.parse(localStorage.getItem(key)||'null')??initial;}catch{return initial;}});
 useEffect(()=>{localStorage.setItem(key,JSON.stringify(value));},[value,key]);return [value,setValue] as const;
}
