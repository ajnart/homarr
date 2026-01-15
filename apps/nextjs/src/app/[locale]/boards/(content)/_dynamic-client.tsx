"use client";

import dynamic from "next/dynamic";

export const DynamicClientBoard = dynamic(() => import("./_client").then((mod) => mod.ClientBoard), {
  ssr: false,
});
