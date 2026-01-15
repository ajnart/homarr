"use client";

import dynamic from "next/dynamic";

export const ClientSideTerminalComponent = dynamic(
  () => import("./terminal").then(({ TerminalComponent }) => TerminalComponent),
  {
    ssr: false,
  },
);
