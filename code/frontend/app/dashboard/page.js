"use client"
import { useSession } from "next-auth/react";
import NavigationBar from "@/components/navbar";
import ErrorPage from 'next/error'
import Link from "next/link";

export default function Dashboard() {
    const { data: session } = useSession();
    
    if (session) {
        return (
            <>
                <main>
                    <NavigationBar />
                    <div className="flex justify-center items-center">
                        <div className="flex flex-col space-y-3 bg-white rounded-md w-[600px] mt-[6%] p-10 text-justify">
                            <b>Welcome to AligNET!</b>
                            <ul className={"list-disc list-inside ml-5 space-y-2"}>
                                <li>Get started by uploading your own <Link className="underline text-blue-500" href={{
                                    pathname: "/files/references/upload"
                                }}>reference</Link> and <Link className="underline text-blue-500" href={{
                                    pathname: "/files/reads/upload"
                                }}>reads</Link> files.</li>
                                <li>Uploaded files may be viewed using an embedded genome visualization component 
                                based on the Integrative Genomics Viewer (IGV). </li>
                                <li>Files may also be shared to other users through their email addresses.</li>
                                <li>Reference of various organisms are also available through the <Link className="underline text-blue-500" href={{
                                    pathname: "/files/references/library"
                                }}>reference library</Link>.</li>
                            </ul>
                        </div>
                    </div>
                </main>
            </>
        )
    }
    return <ErrorPage statusCode={404} />
}