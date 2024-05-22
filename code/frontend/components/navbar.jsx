"use client"

import React from 'react';
import Link from 'next/link';
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { useSession, signOut } from "next-auth/react";
import { Button } from './ui/button';

export default function NavigationBar() {
    const { data: session } = useSession();
    return (
        <>
            <NavigationMenu className="mb-5 bg-slate-950 text-sm flex items-center justify-between">
                <NavigationMenuList>
                    <NavigationMenuItem>
                        <Link href="/dashboard" legacyBehavior passHref>
                            <NavigationMenuLink className={`${navigationMenuTriggerStyle()} font-bold`}>
                                AligNET
                            </NavigationMenuLink>
                        </Link>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <NavigationMenuTrigger>References</NavigationMenuTrigger>
                        <NavigationMenuContent>
                            <div className='bg-slate-950 w-48 space-y-2 p-2 rounded-md'>
                                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                                    <Link href="/files/references/" legacyBehavior passHref>
                                        My References
                                    </Link>
                                </NavigationMenuLink>
                                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                                    <Link href="/files/references/shared/" legacyBehavior passHref>
                                        Shared References
                                    </Link>
                                </NavigationMenuLink>
                                <Link href="/files/references/upload" legacyBehavior passHref>
                                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                                        Upload Reference
                                    </NavigationMenuLink>
                                </Link>
                                <Link href="/files/references/library" legacyBehavior passHref>
                                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                                        <p> Reference Library </p>
                                    </NavigationMenuLink>
                                </Link>
                            </div>
                        </NavigationMenuContent>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <NavigationMenuTrigger>Reads</NavigationMenuTrigger>
                        <NavigationMenuContent>
                            <div className='bg-slate-950 w-48 space-y-2 p-2 rounded-md'>
                                <Link href="/files/reads" legacyBehavior passHref>
                                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                                        My Reads
                                    </NavigationMenuLink>
                                </Link>
                                <Link href="/files/reads/shared" legacyBehavior passHref>
                                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                                        Shared Reads
                                    </NavigationMenuLink>
                                </Link>
                                <Link href="/files/reads/upload" legacyBehavior passHref>
                                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                                        Upload Reads
                                    </NavigationMenuLink>
                                </Link>
                            </div>
                        </NavigationMenuContent>
                    </NavigationMenuItem>
                </NavigationMenuList>
                <div>
                    <NavigationMenuItem>
                        <NavigationMenuTrigger>Hello, {session.givenName}!</NavigationMenuTrigger>
                        <NavigationMenuContent>
                            <div className='bg-slate-950 w-48 space-y-2 p-2 rounded-md text-white'>
                                <p className='p-3 text-xs'>You are logged in as {session.user.email}.</p>
                                <hr/>
                                <Button className="bg-inherit hover:bg-inherit" onClick={() => signOut({ callbackUrl: "/", redirect:true }) }>Sign out</Button>
                            </div>
                        </NavigationMenuContent>
                    </NavigationMenuItem>
                </div>
            </NavigationMenu>
        </>
    );
}
