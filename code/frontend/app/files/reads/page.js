"use client";

import NavigationBar from "@/components/navbar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { PiDna } from "react-icons/pi";
import { IoSearch, IoPencil, IoTrash, IoShareOutline } from "react-icons/io5";
import { TbUserShare } from "react-icons/tb";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/use-toast"
import ErrorPage from 'next/error';
import { BASE_URL } from "@/lib/constants";

export default function MyReadsList() {

    const [files, setFiles] = useState([]);
    const { data: session } = useSession();
    const { toast } = useToast();

    async function deleteFile (fileID) {
        console.log(fileID);
        try {
            const response = await fetch(BASE_URL + "/backend/files/" + fileID, {
                method: "DELETE",
                headers: {
                    'Authorization': `Token ${session.accessToken}`,
                    'User-ID': session.userID
                },
            });
            if (response.ok) {
                console.log("File deleted!")
                toast({
                    title: "File deleted!",
                    description: "File has been deleted from the server.",
                })
                setFiles(files.filter((file) => file.id !== fileID));
            } else {
                console.error("File upload failed with status:", response.status)
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    async function shareFile (fileID, accessEmail) {
        const data = {
            accessEmail: accessEmail,
            fileID: fileID,
            ownerID: session.userID
        }
        console.log(data)
        try {
            const response = await fetch(BASE_URL + "/backend/file/share/", {
                method: "POST",
                headers: {
                    Authorization: `Token ${session.accessToken}`,
                    'Content-type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            if (response.ok) {
                console.log("File shared!")
                toast({
                    title: "File shared!",
                    description: "File has been shared to the user.",
                })
            } else {
                console.error("File sharing failed with status:", response.status)
                return response.json().then(data => {
                    const errorMessage = data.message;
                    console.error("File sharing failed with status:", response.status, errorMessage);
                    toast({
                        title: "File sharing failed!",
                        description: errorMessage,
                    });
                });
            }
        } catch (error) {
            console.error("Error sharing data:", error);
        }
    }

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch(BASE_URL + "/backend/files/reads/" + session.userID, {
                    headers: {
                        'Authorization': `Token ${session.accessToken}`
                    },
                }
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch data.");
                }
                const data = await response.json();
                setFiles(data);
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
                            <p className="font-bold text-md mb-3">My reads files</p>
                            {files.length > 0 ? (
                                files.map((file) => {
                                        return (
                                            <div
                                                key={file.id}
                                                className="flex flex-row rounded-md justify-between items-center h-14 hover:bg-slate-50"
                                            >
                                                <div className="flex flex-row space-x-3">
                                                    <PiDna size={50} className="text-blue-500" />
                                                    <div className="flex flex-col space-y-1">
                                                        <p className="font-bold text-md text-blue-500 underline">
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
                                                            pathname: "/files/reads/" + file.slug,
                                                            query: {
                                                                id: file.id,
                                                            },
                                                        }}
                                                        className="flex flex-row bg-blue-500 text-white hover:bg-blue-800 px-4 py-1 space-x-2 rounded-full transition-colors"
                                                    >
                                                        <IoSearch size={20} />
                                                        <b>View</b>
                                                    </Link>
                                                    <Popover>
                                                        <PopoverTrigger><button
                                                            className="flex flex-row bg-white text-slate-500 outline outline-1 outline-slate-500 hover:bg-slate-500 hover:text-white px-4 py-1 space-x-2 rounded-full transition-colors"
                                                        >
                                                            <TbUserShare size={20} />
                                                            <p>Share</p>
                                                        </button></PopoverTrigger>
                                                        <PopoverContent>
                                                            <div className="flex flex-col text-sm p-2 space-y-3">
                                                                <b>Share &quot;{file.name}&quot;</b>
                                                                <p>Enter user&apos;s email address</p>
                                                                <Input type="email" id="accessEmail" placeholder="jane.doe@example.com" />
                                                                <p className="text-xs text-slate-500">For reads connected to a reference file, the reference must first be shared to this user.</p>
                                                                <div className="flex justify-center">
                                                                    <button onClick={() => shareFile(file.id, document.getElementById("accessEmail").value)} className="flex flex-row w-fit bg-slate-500 text-white hover:bg-slate-800 hover:text-white px-4 py-1 space-x-2 rounded-full transition-colors"><IoShareOutline size={15} className="mr-1 mt-0.5" />Send</button>
                                                                </div>
                                                            </div>
                                                        </PopoverContent>
                                                    </Popover>
                                                    <Link
                                                        href={{
                                                            pathname: "/files/reads/edit/" + file.slug,
                                                            query: {
                                                                id: file.id,
                                                            },
                                                        }}
                                                        className="flex flex-row bg-white text-slate-500 outline outline-1 outline-slate-500 hover:bg-slate-500 hover:text-white px-4 py-1 space-x-2 rounded-full transition-colors"
                                                    >
                                                        <IoPencil size={20} />
                                                        <p>Edit</p>
                                                    </Link>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <button
                                                                className="flex flex-row bg-white text-red-500 outline outline-1 outline-red-500 hover:bg-red-500 hover:text-white px-4 py-1 space-x-2 rounded-full transition-colors"
                                                            >
                                                                <IoTrash size={20} />
                                                                <p>Delete</p>
                                                            </button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>
                                                                    Are you absolutely sure?
                                                                </AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    This action cannot be undone. This will
                                                                    permanently delete your file from the server.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => deleteFile(file.id)}
                                                                >
                                                                    Continue
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </div>
                                        );
                                    }
                            )
                            ) : (
                                <p className="text-center p-5">No reads files uploaded.</p>
                            )}
                        </div>
                    </div>
                </main>
            </>
        );
    }
    return <ErrorPage statusCode={404} />
}