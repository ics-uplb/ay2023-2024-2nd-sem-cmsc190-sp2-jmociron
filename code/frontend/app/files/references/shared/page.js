"use client";

import NavigationBar from "@/components/navbar";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { PiDna } from "react-icons/pi";
import { IoSearch } from "react-icons/io5";
import Link from "next/link";
import ErrorPage from 'next/error';
import { BASE_URL } from "@/lib/constants";

export default function MySharedReferenceList() {

    const [files, setFiles] = useState([]);
    const { data: session } = useSession();

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch(BASE_URL + "/backend/files/shared/reference/" + session.userID, {
                    headers: {
                        'Authorization': `Token ${session.accessToken}`
                    },
                }
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch data.");
                }
                const data = await response.json();
                setFiles(data.filter((file) => file.file_type === "reference"));
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
                        <div className="bg-white rounded-md px-7 py-5 space-y-3">
                            <p className="font-bold text-md mb-3">Shared references</p>
                            {files.length > 0 ? (
                                files.map((file) => {
                                        return (
                                            <div
                                                key={file.id}
                                                className="flex flex-row rounded-md justify-between items-center h-14 hover:bg-slate-50"
                                            >
                                                <div className="flex flex-row space-x-3">
                                                    <PiDna size={50} className="text-green-500" />
                                                    <div className="flex flex-col space-y-1">
                                                        <p className="font-bold text-md text-green-500 underline">
                                                            {file.name}
                                                        </p>
                                                        <p className="text-sm text-slate-500 italic">
                                                            {file.organism}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-row space-x-5 items-center mr-2">
                                                    <p className="text-slate-500">Shared to you by {file.user}</p>
                                                    <Link
                                                        href={{
                                                            pathname: "/files/references/" + file.slug,
                                                            query: {
                                                                id: file.id,
                                                            },
                                                        }}
                                                        className="flex flex-row bg-green-500 text-white hover:bg-green-800 px-4 py-1 space-x-2 rounded-full transition-colors"
                                                    >
                                                        <IoSearch size={20} />
                                                        <b>View</b>
                                                    </Link>
                                                </div>
                                            </div>
                                        );
                                    }
                                )
                            ) : (
                                <p className="text-center p-5">No reference files shared to you.</p>
                            )}
                        </div>
                    </div>
                </main>
            </>
        );
    }
    return <ErrorPage statusCode={404} />
}