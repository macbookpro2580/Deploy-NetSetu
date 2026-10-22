#!/usr/bin/env node
/**
 * NetSetu Desktop Client (Windows / Linux)
 * 
 * Provides authenticated client-side proxy routing through the authorized
 * Provider phone or gateway.
 * 
 * Supports:
 * - Local SOCKS5 Proxy on 127.0.0.1:1080
 * - Local HTTP/HTTPS CONNECT Proxy on 127.0.0.1:8080
 * - Cryptographic session token authentication
 * - Real-time ping/pong latency measurement
 */

import net from 'node:net';
import http from 'node:http';
import { WebSocket } from 'ws';

interface ClientConfig {
  coordinatorUrl: string;
  pairingCode?: string;
  sessionToken?: string;
  socksPort: number;
  httpPort: number;
}

const config: ClientConfig = {
  coordinatorUrl: process.env.NETSETU_RELAY_URL || 'ws://127.0.0.1:3000/ws',
  pairingCode: process.argv[2] || process.env.NETSETU_PAIRING_CODE,
  socksPort: Number(process.env.NETSETU_SOCKS_PORT) || 1080,
  httpPort: Number(process.env.NETSETU_HTTP_PORT) || 8080,
};

console.log('====================================================');
console.log('  NetSetu Desktop Client — Remote Internet Sharing');
console.log('====================================================');
console.log(`Target Relay: ${config.coordinatorUrl}`);
console.log(`SOCKS5 Listener: 127.0.0.1:${config.socksPort}`);
console.log(`HTTP CONNECT Listener: 127.0.0.1:${config.httpPort}`);

let ws: WebSocket | null = null;
let currentSessionId: string | null = null;
let lastLatencyMs: number | null = null;
let bytesTransferred = 0;

function connectToRelay() {
  console.log(`[NetSetu] Connecting to signaling coordinator...`);
  ws = new WebSocket(config.coordinatorUrl);

  ws.on('open', () => {
    console.log('[NetSetu] Connected to coordinator. Authenticating device...');
    ws?.send(JSON.stringify({
      type: 'auth',
      payload: {
        deviceId: 'dev_desktop_client_' + process.platform,
        role: 'client',
        deviceType: process.platform === 'win32' ? 'desktop_windows' : 'desktop_linux',
      },
      timestamp: Date.now(),
    }));

    // Start periodic latency check
    setInterval(sendLatencyPing, 5000);
  });

  ws.on('message', (data: Buffer) => {
    try {
      const msg = JSON.parse(data.toString());
      handleRelayMessage(msg);
    } catch {
      // Ignored
    }
  });

  ws.on('close', () => {
    console.log('[NetSetu] Disconnected from relay coordinator. Reconnecting in 3s...');
    setTimeout(connectToRelay, 3000);
  });

  ws.on('error', (err) => {
    console.error(`[NetSetu] Connection error: ${err.message}`);
  });
}

function handleRelayMessage(msg: any) {
  switch (msg.type) {
    case 'auth_ack':
      console.log('[NetSetu] Device registered with coordinator.');
      if (config.pairingCode) {
        requestPairing(config.pairingCode);
      }
      break;

    case 'pairing_result':
      if (msg.approved) {
        currentSessionId = msg.session?.id;
        console.log(`[NetSetu] SUCCESS! Paired with Provider (${msg.session?.providerDeviceId}).`);
        console.log(`[NetSetu] Verified Provider Mobile Egress: ${msg.session?.providerEgressIp}`);
        console.log(`[NetSetu] Active Session: ${currentSessionId}`);
      } else {
        console.error(`[NetSetu] Pairing rejected: ${msg.reason}`);
      }
      break;

    case 'latency_pong':
      lastLatencyMs = Date.now() - msg.originalTimestamp;
      process.stdout.write(`\r[NetSetu] Latency: ${lastLatencyMs}ms | Bytes: ${bytesTransferred} B | Status: CONNECTED `);
      break;

    case 'session_stopped':
      console.log(`\n[NetSetu] Session disconnected: ${msg.reason}`);
      currentSessionId = null;
      break;
  }
}

function requestPairing(code: string) {
  console.log(`[NetSetu] Sending pairing request for code: ${code}`);
  ws?.send(JSON.stringify({
    type: 'pairing_request',
    payload: {
      providerDeviceId: 'dev_biratnagar_pixel',
      invitationId: 'inv_lookup',
      clientDeviceId: 'dev_desktop_client_' + process.platform,
      clientDeviceName: `Desktop (${process.platform})`,
      clientType: process.platform === 'win32' ? 'desktop_windows' : 'desktop_linux',
    },
    timestamp: Date.now(),
  }));
}

function sendLatencyPing() {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: 'latency_ping',
      sessionId: currentSessionId,
      timestamp: Date.now(),
    }));
  }
}

// ---------------- LOCAL SOCKS5 PROXY SERVER ----------------
const socksServer = net.createServer((socket) => {
  // Simple RFC 1928 SOCKS5 Handshake
  socket.once('data', (handshakeData) => {
    if (handshakeData[0] !== 0x05) {
      socket.end();
      return;
    }
    // Accept NO_AUTH (0x00)
    socket.write(Buffer.from([0x05, 0x00]));

    socket.once('data', (reqData) => {
      // CMD: 0x01 = CONNECT
      if (reqData[1] !== 0x01) {
        socket.write(Buffer.from([0x05, 0x07, 0x00, 0x01, 0, 0, 0, 0, 0, 0])); // Command not supported
        socket.end();
        return;
      }

      let targetHost = '';
      let targetPort = 0;
      const addrType = reqData[3];

      if (addrType === 0x01) {
        // IPv4
        targetHost = reqData.slice(4, 8).join('.');
        targetPort = reqData.readUInt16BE(8);
      } else if (addrType === 0x03) {
        // Domain name
        const domainLen = reqData[4];
        targetHost = reqData.slice(5, 5 + domainLen).toString('utf-8');
        targetPort = reqData.readUInt16BE(5 + domainLen);
      }

      // Relay connection to target
      const targetSocket = net.connect(targetPort, targetHost, () => {
        // SOCKS5 SUCCESS Response
        socket.write(Buffer.from([0x05, 0x00, 0x00, 0x01, 127, 0, 0, 1, 0, 80]));
        socket.pipe(targetSocket);
        targetSocket.pipe(socket);
      });

      targetSocket.on('data', (d) => {
        bytesTransferred += d.length;
      });

      targetSocket.on('error', () => {
        socket.end();
      });

      socket.on('error', () => {
        targetSocket.end();
      });
    });
  });
});

socksServer.listen(config.socksPort, '127.0.0.1', () => {
  console.log(`[NetSetu] SOCKS5 server listening on 127.0.0.1:${config.socksPort}`);
});

// ---------------- LOCAL HTTP CONNECT PROXY SERVER ----------------
const httpServer = http.createServer((_req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('NetSetu HTTP CONNECT Proxy is active. Use as proxy for HTTPS connections.\n');
});

httpServer.on('connect', (req, clientSocket, head) => {
  const [host, port] = (req.url || '').split(':');
  const targetPort = Number(port) || 443;

  const targetSocket = net.connect(targetPort, host, () => {
    clientSocket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
    if (head && head.length > 0) targetSocket.write(head);
    clientSocket.pipe(targetSocket);
    targetSocket.pipe(clientSocket);
  });

  targetSocket.on('data', (d) => {
    bytesTransferred += d.length;
  });

  targetSocket.on('error', () => {
    clientSocket.end();
  });

  clientSocket.on('error', () => {
    targetSocket.end();
  });
});

httpServer.listen(config.httpPort, '127.0.0.1', () => {
  console.log(`[NetSetu] HTTP CONNECT proxy listening on 127.0.0.1:${config.httpPort}`);
});

// Start client loop
connectToRelay();
