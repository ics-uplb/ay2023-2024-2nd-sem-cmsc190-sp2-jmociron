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
import ErrorPage from 'next/error';
import { BASE_URL } from "@/lib/constants";

export default function UploadReadsForm() {
    const { toast } = useToast();
    const { data: session } = useSession();
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm();

    const fastaFileTypes = ["fasta", "fas", "fa", "fna", "ffn", "faa"]
    async function onSubmit(data) {
        const formData = new FormData();
        for (const key in data) {
            if (data[key] instanceof FileList) {
                for (let i = 0; i < data[key].length; i++) {
                    if((key === "main_file" && !fastaFileTypes.includes(data[key][i].name.split(".").pop()))){
                        toast({
                            title: "Wrong file type for alignment file!",
                            description: "Please upload a FASTA file.",
                        })
                        return;
                    }
                    if((key === "index_file" && data[key][i].name.split(".").pop() != "fai")){
                        toast({
                            title: "Wrong file type for index file!",
                            description: "Please upload a .fai file.",
                        })
                        return;
                    }
                    formData.append(key, data[key][i]);
                }
            } else {
                formData.append(key, data[key]);
            }
        }
        formData.append("userID", session.userID);
        formData.append("file_type", "reference");
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
                console.log("File uploaded!")
                toast({
                    title: "File uploaded!",
                    description: "File has been uploaded to the server.",
                })
            } else {
                console.error("File upload failed with status:", response.status)
            }
        } catch (error) {
            console.error('Error during file upload:', error.message);
        }
    }
    if (session) {
        return (
            <>
                <main className="flex flex-col items-center justify-center h-full">
                    <NavigationBar />
                    <div className="w-[400px] max-w-[400px] text-sm">
                        <p className="font-bold text-slate-950 mb-4">Upload reference file</p>
                        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col space-y-3">
                            <div className="space-y-1">
                                <p>File name<b className="text-red-600">*</b> </p>
                                <Input style={errors.name && { border: "2px solid #E02926" }} type="text" name="name" placeholder="Human reference genome" {...register("name", { required: true })} />
                                {errors.name && <span className="text-xs text-red-600 flex flex-row ml-1"> <IoWarning size={15} className="mr-1" /> File name is required</span>}
                            </div>
                            <div className="space-y-1">
                                <p>Organism<b className="text-red-600">*</b></p>
                                <Input style={errors.organism && { border: "2px solid #E02926" }} type="text" name="organism" placeholder="Homo sapiens" {...register("organism", { required: true })} />
                                {errors.organism && <span className="text-xs text-red-600 flex flex-row ml-1"> <IoWarning size={15} className="mr-1" /> Scientific name is required</span>}
                            </div>
                            <div className="space-y-1">
                                <p>Reference file (.fa, .fna, .fas)<b className="text-red-600">*</b></p>
                                <Input style={errors.main_file && { border: "2px solid #E02926" }} type="file" name="main_file"{...register("main_file", { required: true })} />
                                {errors.main_file && <span className="text-xs text-red-600 flex flex-row ml-1"> <IoWarning size={15} className="mr-1" /> Reference file is required</span>}
                            </div>
                            <div className="space-y-1">
                                <p>Index file (.fai)<b className="text-red-600">*</b></p>
                                <Input style={errors.index_file && { border: "2px solid #E02926" }} type="file" name="index_file" {...register("index_file", { required: true })} />
                                {errors.index_file && <span className="text-xs text-red-600 flex flex-row ml-1"> <IoWarning size={15} className="mr-1" /> Index file is required</span>}
                            </div>
                            <br/>
                            <Button type="submit"><MdOutlineFileUpload size={17} className="mr-1" />Submit</Button>
                        </form>
                    </div>
                </main>
            </>
        )
    }
    return <ErrorPage statusCode={404} />
}