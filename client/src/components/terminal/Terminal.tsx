// client/src/components/terminal/Terminal.tsx
import React, { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import axios from 'axios';

const TerminalComponent: React.FC = () => {
    const terminalRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const term = new Terminal();
        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);
        term.open(terminalRef.current!);
        fitAddon.fit();

        const socket = new WebSocket('ws://localhost:3000'); // Adjust this URL as needed

        socket.onmessage = (event) => {
            term.write(event.data);
        };

        term.onData(async (data) => {
            // Send command to the server
            const command = data.trim();
            if (command) {
                try {
                    const response = await axios.post('http://localhost:3000/api/terminal/execute', { command });
                    term.write(response.data.output);
                } catch (error:any) {
                    term.write(`Error: ${error.response?.data?.error || 'Unknown error'}\n`);
                }
            }
        });

        socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        socket.onclose = () => {
            console.log('WebSocket connection closed');
        };

        return () => {
            socket.close();
            term.dispose();
        };
    }, []);

    return (
        <div
            className="terminal-container"
            ref={terminalRef}
            style={{ height: '300px', width: '100%' }}
        ></div>
    );
};

export default TerminalComponent;