'use client';
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export default function Create() {
    const router = useRouter();
    const pageLoadedRef= useRef(false);

    useEffect(() => {
        if(!pageLoadedRef.current){
            router.push("/content/create/outlines")
            pageLoadedRef.current = true
        }
    }, [pageLoadedRef.current])
}