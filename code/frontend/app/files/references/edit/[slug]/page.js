"use client";

import NavigationBar from "@/components/navbar";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { MdOutlineFileUpload } from "react-icons/md";
import { useToast } from "@/components/ui/use-toast"
import ErrorPage from 'next/error';
import { BASE_URL } from "@/lib/constants";

export default function FileEditForm({ searchParams }) {
    const id = searchParams.id;
    const { toast } = useToast();
    const [file, setFile] = useState({});
    const { data: session } = useSession();

    function truncateFileName(url) {
        const fileNameStart = url.lastIndexOf("/") + 1;
        const fileName = url.substring(fileNameStart, url.length);
        return fileName
    }

    async function onSubmit(event) {
        event.preventDefault()
        const formData = new FormData(event.target);

        let toDelete = [];
        for (let [key, value] of formData.entries()) {
            if (value === "" || (value instanceof File && value.size === 0)) {
                toDelete.push(key);
            }
        }
        for (let key of toDelete) {
            formData.delete(key);
        }
        formData.append("userID", session.userID);

        try {
            const response = await fetch(BASE_URL + '/backend/files/' + id + '/', {
                headers: {
                    'Authorization': `Token ${session.accessToken}`,
                    'User-ID': session.userID
                },
                method: 'PATCH',
                body: formData,
            })
            if (response.ok) {
                console.log("File edited!")
                toast({
                    title: "File edited!",
                    description: "File has been edited in the server.",
                })
                const data = await response.json();
                setFile(data);
            } else {
                console.error("File upload failed with status:", response.status)
            }
        } catch (error) {
            console.error('Error during file upload:', error.message);
        }
    }
    
    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch(BASE_URL + "/backend/files/" + id, {
                    headers: {
                        'Authorization': `Token ${session.accessToken}`,
                        'User-ID': session.userID
                    },
                }
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch data.");
                }
                const data = await response.json();
                setFile(data);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        }
        fetchData().catch(console.error);
    }, [])

    if (session) {
        return (
            <>
                <main className="flex flex-col items-center justify-center h-full">
                    <NavigationBar />
                    <div className="w-[400px] max-w-[400px] text-sm">
                        <p className="font-bold text-slate-950 mb-4">Edit reference file</p>
                        <form onSubmit={onSubmit} className="flex flex-col space-y-3">
                            <div className="space-y-1">
                                <p>File name </p>
                                <Input type="text" name="name" placeholder={file.name} />
                            </div>
                            <div className="space-y-1">
                                <p>Organism</p>
                                <Input type="text" name="organism" placeholder={file.organism} />
                            </div>
                            <div className="space-y-1">
                                <p>Edit reference file (.fa, .fna, .fas)</p>
                                <p className="text-xs text-slate-500">Current file: <br /> {file.main_file ? truncateFileName(file.main_file) : 'No file uploaded'}</p>
                                <Input type="file" name="main_file" />
                            </div>
                            <div className="space-y-1">
                                <p>Edit index file (.fai)</p>
                                <p className="text-xs text-slate-500">Current file: <br /> {file.index_file ? truncateFileName(file.index_file) : 'No file uploaded'}</p>
                                <Input type="file" name="index_file" />
                            </div>
                            <br />
                            <Button type="submit"><MdOutlineFileUpload size={17} className="mr-1" />Submit</Button>
                        </form>
                    </div>
                </main>
            </>
        );
    }
    return <ErrorPage statusCode={404} />
}