"use client"

import React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button"
import NavigationBar from "@/components/navbar";
import { useSession } from "next-auth/react";
import { createBrowser } from 'igv';
import ErrorPage from 'next/error';
import { BASE_URL } from "@/lib/constants";

export default function ReadsDetails({ searchParams }) {
    const id = searchParams.id;
    const { data: session } = useSession();
    const [dataFetched, setDataFetched] = useState(false);
    const [browserCreated, setBrowserCreated] = useState(false);
    const [igvConfig, setIgvConfig] = useState({
        isFile: true,
        genome: "",
        fastaURL: "",
        faiURL: "",
        bamURL: "",
        baiURL: "",
        fileName: ""
    });

    async function fetchData() {
        const reads = await (await fetch(BASE_URL + "/backend/files/" + id, {
            headers: {
                'Authorization': `Token ${session.accessToken}`,
                'User-ID': session.userID
            },
        })).json();

        if (reads.reference_file) {
            const reference = await (await fetch(BASE_URL + "/backend/files/" + reads.reference_file, {
                headers: {
                    'Authorization': `Token ${session.accessToken}`,
                    'User-ID': session.userID
                },
            })).json();
            if (!dataFetched) {
                setIgvConfig({
                    isFile: true,
                    fastaURL: reference.main_file,
                    faiURL: reference.index_file,
                    bamURL: reads.main_file,
                    baiURL: reads.index_file,
                    fileName: reads.name
                })
                setDataFetched(true);
            }
        } else {
            const reference = await (await fetch(BASE_URL + "/backend/library/reference/" + reads.reference_link, {
                headers: {
                    'Authorization': `Token ${session.accessToken}`
                },
            })).json();
            if (!dataFetched) {
                setIgvConfig({
                    isFile: false,
                    fastaURL: reference.fastaURL,
                    faiURL: reference.indexURL,
                    genome: reference.genome,
                    bamURL: reads.main_file,
                    baiURL: reads.index_file,
                    fileName: reads.name
                })
                setDataFetched(true);
            }
        }
    }

    useEffect(() => {
        if (!browserCreated && !dataFetched) {
            fetchData();
        }
        
        if (dataFetched) {
            const igvDiv = document.getElementById("igv-div");
            var igvOptions = {}
            if (igvConfig.isFile){
                igvOptions = {
                    reference: {
                        fastaURL: igvConfig.fastaURL,
                        indexURL: igvConfig.faiURL,
                        tracks: [
                            {
                                type: "alignment",
                                format: "bam",
                                name: igvConfig.fileName,
                                url: igvConfig.bamURL,
                                indexURL: igvConfig.baiURL
                            }
                        ]
                    },
                };
            } else {
                igvOptions = {
                    genome: igvConfig.genome,
                    reference: {
                        fastaURL: igvConfig.fastaURL,
                        indexURL: igvConfig.indexURL,
                        tracks: [
                            {
                                type: "alignment",
                                format: "bam",
                                name: igvConfig.fileName,
                                url: igvConfig.bamURL,
                                indexURL: igvConfig.baiURL
                            }
                        ]
                    },
                };
            }
            const currentBrowser = igvDiv && igvDiv.firstChild;
            if (currentBrowser) {
                currentBrowser.remove();
            }

            igv.createBrowser(igvDiv, igvOptions)
                .then(function (browser) {
                    console.log("Created IGV browser");
                    setBrowserCreated(true);
                });
        }
    }, [browserCreated, dataFetched, igvConfig]);

    if(session){
        return (
            <>
                <NavigationBar />
                <div id="igv-div"></div>
            </>
        )
    }
    return <ErrorPage statusCode={404} />
}
