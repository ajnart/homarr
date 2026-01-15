"use client";

import { useEffect, useRef } from "react";
import { Box } from "@mantine/core";
import { CanvasAddon } from "@xterm/addon-canvas";
import { FitAddon } from "@xterm/addon-fit";
import { Terminal } from "@xterm/xterm";

import { clientApi } from "@homarr/api/client";

import { useLogContext } from "./log-context";
import classes from "./terminal.module.css";

export const TerminalComponent = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { activeLevels } = useLogContext();

  const terminalRef = useRef<Terminal>(null);
  clientApi.log.subscribe.useSubscription(
    {
      levels: activeLevels,
    },
    {
      onData(data) {
        terminalRef.current?.writeln(data.message);
        terminalRef.current?.refresh(0, terminalRef.current.rows - 1);
      },
      onError(err) {
        // This makes sense as logging might cause an infinite loop
        alert(err);
      },
    },
  );

  useEffect(() => {
    if (!ref.current) {
      return () => undefined;
    }

    const canvasAddon = new CanvasAddon();

    terminalRef.current = new Terminal({
      cursorBlink: false,
      disableStdin: true,
      convertEol: true,
    });
    terminalRef.current.open(ref.current);
    terminalRef.current.loadAddon(canvasAddon);

    // This is a hack to make sure the terminal is rendered before we try to fit it
    // You can blame @Meierschlumpf for this
    setTimeout(() => {
      const fitAddon = new FitAddon();
      terminalRef.current?.loadAddon(fitAddon);
      fitAddon.fit();
    });

    return () => {
      terminalRef.current?.dispose();
      canvasAddon.dispose();
    };
  }, []);
  return <Box ref={ref} id="terminal" className={classes.outerTerminal} h="100%"></Box>;
};
