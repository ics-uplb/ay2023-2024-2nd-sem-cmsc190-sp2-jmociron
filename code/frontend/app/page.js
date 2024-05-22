"use client"
import LoginButton from "@/components/login-button";
import Dashboard from "./dashboard/page";
import { useSession } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();
  if(session){
    return <Dashboard/>
  }
  return (
    <main className="grid grid-cols-2">
      <div className="flex flex-col w-50% bg-slate-950"></div>
      <div className="flex flex-col w-50%"><div className="flex items-center justify-center h-screen">
        <div className="flex flex-col min-w-[500px] p-7 rounded-md space-y-5">
          <h1 className="text-xl">Welcome to <b>AligNET!</b></h1>
          <p className="text-left">
          A web application for viewing, storing, <br/>
          and sharing genomic references and reads.
          </p>
          <LoginButton/>
        </div>
      </div></div>
    </main>
  );
}
