"use client"

import React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button"
import NavigationBar from "@/components/navbar";
import { useSession } from "next-auth/react";
import { createBrowser } from 'igv';
import ErrorPage from 'next/error';
import { BASE_URL } from "@/lib/constants";

export default function ReferenceDetails({ searchParams }) {
    const id = searchParams.id;
    const { data: session } = useSession();
    const [dataFetched, setDataFetched] = useState(false);
    const [browserCreated, setBrowserCreated] = useState(false);
    const [igvConfig, setIgvConfig] = useState({
        fastaURL: "",
        indexURL: ""
    });

    const fetchData = async () => {
        try {
            const response = await fetch(BASE_URL + "/backend/files/" + id, {
                headers: {
                    'Authorization': `Token ${session.accessToken}`,
                    'User-ID': session.userID
                },
            });
            if (!response.ok) {
                throw new Error("Failed to fetch data.");
            }
            const data = await response.json();
            if (!dataFetched) {
                setIgvConfig(
                    {
                        fastaURL: data.main_file,
                        indexURL: data.index_file
                    }
                )
                setDataFetched(true);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }

    useEffect(() => {
        if (!browserCreated && !dataFetched) {
            fetchData();
        }

        if (dataFetched) {
            const igvDiv = document.getElementById("igv-div");
            const igvOptions = {
                reference: {
                    fastaURL: igvConfig.fastaURL,
                    indexURL: igvConfig.indexURL
                }
            };
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
