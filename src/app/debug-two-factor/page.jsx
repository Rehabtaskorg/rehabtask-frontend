"use client";
import { useEffect, useState } from "react";
import { authAPi } from "@/services/auth.api";
import TwoFactorSettings from "@/components/profile/TwoFactorSettings";
export default function DebugTwoFactor() {
 const [ready,setReady]=useState(false);
 const [requests,setRequests]=useState([]);
 useEffect(()=>{
  const initial={enabled:true,mandatory:false,preferredMethod:"sms",methods:{sms:{enabled:true,available:true,destination:"Test phone"},email:{enabled:true,available:true,destination:"Test email"}}};
  const cached=sessionStorage.getItem("debug-two-factor");
  let status=cached?JSON.parse(cached):initial;
  const originals={get:authAPi.getTwoFactorStatus,set:authAPi.setTwoFactorEnabled};
  authAPi.getTwoFactorStatus=async()=>({data:{data:structuredClone(status)}});
  authAPi.setTwoFactorEnabled=async(enabled)=>{
   setRequests(old=>[...old,`PATCH enabled=${enabled}`]);
   status={...status,enabled}; sessionStorage.setItem("debug-two-factor",JSON.stringify(status));
   return {data:{data:structuredClone(status)}};
  };
  setReady(true);
  return ()=>{authAPi.getTwoFactorStatus=originals.get;authAPi.setTwoFactorEnabled=originals.set;};
 },[]);
 return <main className="mx-auto max-w-3xl p-8"><h1>Isolated 2FA UI test — no account changes</h1><p>Requests: {requests.join(", ") || "none"}</p>{ready&&<TwoFactorSettings/>}</main>;
}
