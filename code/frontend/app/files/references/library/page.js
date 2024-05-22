"use client";

import NavigationBar from "@/components/navbar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { PiDna } from "react-icons/pi";
import { IoSearch } from "react-icons/io5";
import ErrorPage from 'next/error';
import { BASE_URL } from "@/lib/constants";

export default function ReferenceLibrary() {

    const [references, setReferences] = useState([]);
    const { data: session } = useSession();

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch(BASE_URL + "/backend/library/reference/", {
                    headers: {
                        'Authorization': `Token ${session.accessToken}`
                    },
                }
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch data.");
                }
                const data = await response.json();
                setReferences(data);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        }
        fetchData().catch(console.error);
    }, [])

    if (session) {
        return (
            <>
                <main>
                    <NavigationBar />
                    <div className="bg-slate-100 px-5 text-sm">
                        <div className="bg-white rounded-md px-7 py-5 space-y-3 max-h-[calc(100vh-100px)] overflow-y-auto">
                            <p className="font-bold text-md mb-3">Reference library</p>
                            {references.length > 0 ? (
                                references.map((file) => {
                                    return (
                                        <div
                                            key={file.id}
                                            className="flex flex-row rounded-md justify-between items-center h-14 hover:bg-slate-50"
                                        >
                                            <div className="flex flex-row space-x-3">
                                                <PiDna size={50} className="text-violet-500" />
                                                <div className="flex flex-col space-y-1">
                                                    <p className="font-bold text-md text-violet-500 underline">
                                                        {file.name}
                                                    </p>
                                                    <p className="text-sm text-slate-500 italic">
                                                        {file.organism}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex flex-row space-x-3 items-center mr-2">
                                                <Link
                                                    href={{
                                                        pathname: "/files/references/library/" + file.genome,
                                                        query: {
                                                            id: file.id,
                                                        },
                                                    }}
                                                    className="flex flex-row bg-violet-500 text-white hover:bg-violet-800 px-4 py-1 space-x-2 rounded-full transition-colors"
                                                >
                                                    <IoSearch size={20} />
                                                    <b>View</b>
                                                </Link>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-center p-5">Reference library is empty.</p>
                            )}
                        </div>
                    </div>
                </main>
            </>
        );
    }
    return <ErrorPage statusCode={404} />
}