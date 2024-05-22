"use client"
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/use-toast"
import NavigationBar from "@/components/navbar";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form"
import { IoWarning } from "react-icons/io5";
import { MdOutlineFileUpload } from "react-icons/md";
import { useState } from "react";
import { PiDna } from "react-icons/pi";
import ErrorPage from 'next/error';
import { BASE_URL } from "@/lib/constants";

export default function UploadReadsForm() {
    const { toast } = useToast();
    const { data: session } = useSession();
    const [referenceFiles, setReferenceFiles] = useState([]);
    const [referenceLinks, setReferenceLinks] = useState([]);
    const [sharedFiles, setSharedFiles] = useState([]);
    const [selected, setSelected] = useState("");
    const [isFile, setIsFile] = useState();
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm();

    async function onSubmit(data) {

        if(!selected) {
            toast({
                title: "File upload failed!",
                description: "Please select a reference file first by clicking \"Search references\".",
            })
            return
        }

        const formData = new FormData();
        for (const key in data) {
            if (data[key] instanceof FileList) {
                for (let i = 0; i < data[key].length; i++) {
                    if((key === "main_file" && data[key][i].name.split(".").pop() != "bam")){
                        toast({
                            title: "Wrong file type for alignment file!",
                            description: "Please upload a .bam file.",
                        })
                        return;
                    }
                    else if((key === "index_file" && data[key][i].name.split(".").pop() != "bai")){
                        toast({
                            title: "Wrong file type for index file!",
                            description: "Please upload a .bai file.",
                        })
                        return;
                    }
                    formData.append(key, data[key][i]);
                }
            } 
            else if (key === "organism") {
                formData.append(key, document.getElementById("organism").value)
            }
            else {
                formData.append(key, data[key]);
            }
        }

        formData.append("userID", session.userID);
        formData.append("file_type", "reads");

        if(isFile){
            formData.append("reffileID", selected);
            formData.append("reflinkID", "");
        } else {
            formData.append("reffileID", "");
            formData.append("reflinkID", selected);
        }
        
        try {
            const response = await fetch(BASE_URL + '/backend/files/', {
                mode: 'cors',
                credentials: 'include',
                headers: {
                    'Authorization': `Token ${session.accessToken}`
                },
                method: 'POST',
                body: formData,
            })
            if (response.ok) {
                console.log("File upload successful!")
                toast({
                    title: "File upload successful!",
                    description: "File has been uploaded to the server.",
                })
            } else {
                console.error("File upload failed with status:", response.status)
            }
        } catch (error) {
            console.error('Error during file upload:', error.message);
        }
    }

    async function searchReferences(organism) {
        if (organism === "") {
            toast({
                title: "Organism field is empty!",
                description: "Please input the scientific name in the organism field.",
            })
            setReferenceFiles([]);
            setReferenceLinks([]);
            setSharedFiles([]);
            return
        }

        // Retrieve own references:
        try {
            const response = await fetch(BASE_URL + "/backend/search/files/" + session.userID + "/" + organism + "/", {
                headers: {
                    Authorization: `Token ${session.accessToken}`,
                    'Content-type': 'application/json'
                },
            });
            if (response.ok) {
                const data = await response.json();
                if (data.length === 0) {
                    setReferenceFiles([]);
                }
                setReferenceFiles(data);
            } else {
                console.error("Retrieving references failed with status:", response.status);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }

        // Retrieve shared references:
        try {
            const response = await fetch(BASE_URL + "/backend/search/shared/" + session.userID + "/" + organism + "/", {
                headers: {
                    Authorization: `Token ${session.accessToken}`,
                    'Content-type': 'application/json',
                },
            });
            if (response.ok) {
                const data = await response.json();
                if (data.length === 0) {
                    setSharedFiles([]);
                }
                setSharedFiles(data);
            } else {
                console.error("Retrieving references failed with status:", response.status);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }

        // Retrieve references from library:
        try {
            const response = await fetch(BASE_URL + "/backend/search/library/" + organism + "/", {
                headers: {
                    Authorization: `Token ${session.accessToken}`,
                    'Content-type': 'application/json'
                },
            });
            if (response.ok) {
                const data = await response.json();
                if (data.length === 0) {
                    setReferenceLinks([]);
                }
                setReferenceLinks(data);
            } else {
                console.error("Retrieving references failed with status:", response.status);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    if (session) {
        return (
            <>
                <main className="flex flex-col items-center justify-center h-full">
                    <NavigationBar/>
                    <div className="flex flex-row text-sm space-x-16 max-h-[calc(100vh-100px)]">
                        <div className="w-[400px] max-w-[400px]">
                            <p className="font-bold text-slate-950 mb-4">Upload reads file</p>
                            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col space-y-3">
                                <div className="space-y-1">
                                    <p>File name<b className="text-red-600">*</b> </p>
                                    <Input style={errors.name && { border: "2px solid #E02926" }} type="text" name="name" placeholder="Human reference genome" {...register("name", { required: true })} />
                                    {errors.name && <span className="text-xs text-red-600 flex flex-row ml-1"> <IoWarning size={15} className="mr-1" /> File name is required</span>}
                                </div>
                                <div className="space-y-1">
                                    <p>Organism<b className="text-red-600">*</b></p>
                                    <Input style={errors.organism && { border: "2px solid #E02926" }} type="text" name="organism" id="organism" placeholder="Homo sapiens" {...register("organism", { required: true })} />
                                    {errors.organism && <span className="text-xs text-red-600 flex flex-row ml-1"> <IoWarning size={15} className="mr-1" /> Scientific name is required</span>}
                                    <div className="flex justify-end text-xs">
                                        <button type="button" onClick={() => searchReferences(document.getElementById("organism").value)} className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full transition-colors px-4 py-1">
                                            <b>Search references</b>
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p>Alignment file (.bam)<b className="text-red-600">*</b></p>
                                    <Input style={errors.main_file && { border: "2px solid #E02926" }} type="file" name="main_file"{...register("main_file", { required: true })} />
                                    {errors.main_file && <span className="text-xs text-red-600 flex flex-row ml-1"> <IoWarning size={15} className="mr-1" /> Alignment file is required</span>}
                                </div>
                                <div className="space-y-1">
                                    <p>Index file (.bai)<b className="text-red-600">*</b></p>
                                    <Input style={errors.index_file && { border: "2px solid #E02926" }} type="file" name="index_file" {...register("index_file", { required: true })} />
                                    {errors.index_file && <span className="text-xs text-red-600 flex flex-row ml-1"> <IoWarning size={15} className="mr-1" /> Index file is required</span>}
                                </div>
                                <br />
                                <Button type="submit"><MdOutlineFileUpload size={17} className="mr-1" />
                                    <b>Submit</b>
                                </Button>
                            </form>
                        </div>
                        <div className="flex flex-col w-[625px] overflow-y-auto">
                            <div className="w-[600px] max-w-[625px]">
                                <b>Your reference files</b>
                                {referenceFiles.length > 0 ? (
                                    referenceFiles.map((reference) => {
                                        return (
                                            <div
                                                key={reference.id}
                                                className={`flex flex-row rounded-md justify-between items-center py-3 px-2 mt-3 ${reference.id === selected ? "bg-blue-200" : "bg-white"}`}
                                            >
                                                <div className="flex flex-row space-x-3">
                                                    <PiDna size={50} className="text-blue-500" />
                                                    <div className="flex flex-col space-y-1">
                                                        <p className="font-bold text-md text-blue-500 underline">
                                                            {reference.name}
                                                        </p>
                                                        <p className="text-sm text-slate-500 italic">
                                                            {reference.organism}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-row space-x-3 items-center mr-2">
                                                    {selected != reference.id ? (
                                                        <button
                                                            onClick={() => {setSelected(reference.id); setIsFile(true); document.getElementById("organism").value = reference.organism}}
                                                            className="flex flex-row bg-blue-500 text-white hover:bg-blue-800 px-4 py-1 space-x-2 rounded-full transition-colors"
                                                        >
                                                            <b>Select</b>
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => {setSelected(""); setIsFile()}}
                                                            className="flex flex-row bg-blue-500 text-white hover:bg-blue-800 px-4 py-1 space-x-2 rounded-full transition-colors"
                                                        >
                                                            <b>Unselect</b>
                                                        </button>
                                                    )}

                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p className="text-center p-5">No matching reference files for the organism.</p>
                                )}
                            </div>
                            <div className="w-[600px] max-w-[600px] mt-5">
                                <b>References shared to you</b>
                                {sharedFiles.length > 0 ? (
                                    sharedFiles.map((reference) => {
                                        return (
                                            <div
                                                key={reference.id}
                                                className={`flex flex-row rounded-md justify-between items-center py-3 px-2 mt-3 ${reference.id === selected ? "bg-green-200" : "bg-white"}`}
                                            >
                                                <div className="flex flex-row space-x-3">
                                                    <PiDna size={50} className="text-green-500" />
                                                    <div className="flex flex-col space-y-1">
                                                        <p className="font-bold text-md text-green-500 underline">
                                                            {reference.name}
                                                        </p>
                                                        <p className="text-sm text-slate-500 italic">
                                                            {reference.organism}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-row space-x-3 items-center mr-2">
                                                    {selected != reference.id ? (
                                                        <button
                                                            onClick={() => {setSelected(reference.id); setIsFile(true); document.getElementById("organism").value = reference.organism}}
                                                            className="flex flex-row bg-green-500 text-white hover:bg-green-800 px-4 py-1 space-x-2 rounded-full transition-colors"
                                                        >
                                                            <b>Select</b>
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => {setSelected(""); setIsFile()}}
                                                            className="flex flex-row bg-green-500 text-white hover:bg-green-800 px-4 py-1 space-x-2 rounded-full transition-colors"
                                                        >
                                                            <b>Unselect</b>
                                                        </button>
                                                    )}

                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p className="text-center p-5">No matching reference files for the organism.</p>
                                )}
                            </div>
                            <div className="w-[600px] max-w-[600px] mt-5">
                                <b>References from library</b>
                                {referenceLinks.length > 0 ? (
                                    referenceLinks.map((reference) => {
                                        return (
                                            <div
                                                key={reference.id}
                                                className={`flex flex-row rounded-md justify-between items-center py-3 px-2 mt-3 ${reference.id === selected ? "bg-violet-200" : "bg-white"}`}
                                            >
                                                <div className="flex flex-row space-x-3">
                                                    <PiDna size={50} className="text-violet-500" />
                                                    <div className="flex flex-col space-y-1">
                                                        <p className="font-bold text-md text-violet-500 underline">
                                                            {reference.name}
                                                        </p>
                                                        <p className="text-sm text-slate-500 italic">
                                                            {reference.organism}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-row space-x-3 items-center mr-2">
                                                    {selected != reference.id ? (
                                                        <button
                                                            onClick={() => {setSelected(reference.id); setIsFile(false); document.getElementById("organism").value = reference.organism}}
                                                            className="flex flex-row bg-violet-500 text-white hover:bg-violet-800 px-4 py-1 space-x-2 rounded-full transition-colors"
                                                        >
                                                            <b>Select</b>
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => {setSelected(""); setIsFile()}}
                                                            className="flex flex-row bg-violet-500 text-white hover:bg-violet-800 px-4 py-1 space-x-2 rounded-full transition-colors"
                                                        >
                                                            <b>Unselect</b>
                                                        </button>
                                                    )}

                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p className="text-center p-5">No matching reference files for the organism.</p>
                                )}
                            </div>
                        </div>

                    </div>
                </main>
            </>
        )
    }
    return <ErrorPage statusCode={404} />
}