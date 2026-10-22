# NetSetu — Remote Internet Sharing Platform

NetSetu allows any smartphone or computer with active internet to voluntarily share that connection with an authorized receiver phone or computer across an encrypted reverse tunnel.

> **Core Engineering Guarantee:** The provider's device is the physical public internet exit node. Requests are executed by the provider device's network stack—the public internet sees the provider's IP, not a cloud datacenter IP.

---

## 1. Project Structure

```
├── android-project/             # Complete Android Studio Gradle Project
│   ├── app/src/main/
│   │   ├── AndroidManifest.xml  # VpnService & Foreground Service declarations
│   │   └── java/np/netsetu/app/
│   │       ├── MainActivity.kt           # Jetpack Compose UI (Provider & Client modes)
│   │       ├── vpn/NetSetuVpnService.kt  # Android VpnService TUN interceptor
│   │       ├── provider/NetSetuProviderService.kt # Provider mobile cellular egress engine
│   │       └── net/TunnelProtocol.kt     # Binary/JSON tunnel protocol
│   ├── build.gradle.kts
│   └── settings.gradle.kts
├── desktop-client/              # Windows & Linux Node.js Client
│   ├── src/client.ts            # SOCKS5 (1080) & HTTP CONNECT (8080) client proxy
│   └── package.json
├── docs/                        # Engineering Specifications & Docs
│   ├── ARCHITECTURE.md          # Architecture Decision Record (CGNAT, WireGuard vs Reverse Tunnel)
│   ├── DEPLOYMENT.md            # Production deployment (Docker, Nginx, Let's Encrypt)
│   ├── ANDROID_GUIDE.md         # Android Studio build, VpnService, testing
│   ├── DESKTOP_GUIDE.md         # Windows 10/11 & Linux proxy commands
│   └── SECURITY.md              # Threat model, replay protection, privacy policy
├── src/                         # Full-Stack Web Companion & UI
│   ├── server/                  # Backend Express & WebSocket Relay
│   │   ├── auth.ts              # Scrypt hashing & token validation
│   │   ├── db.ts                # Persistent storage for users, devices, sessions, audit
│   │   ├── pairing.ts           # Crockford Base32 codes & rate-limiting lockout
│   │   ├── routes.ts            # REST API endpoints
│   │   ├── tunnel.ts            # WebSocket reverse tunnel coordinator
│   │   └── tests.test.ts        # Automated unit & integration tests
│   ├── components/              # 11 Modular Screen Components
│   ├── App.tsx                  # Root state & signaling manager
│   └── types.ts                 # Type definitions
├── server.ts                    # Full-Stack entrypoint (Express + Vite + WS)
├── Dockerfile                   # Production container
├── docker-compose.yml           # Multi-container orchestration
└── package.json
```

---

## 2. Quickstart (Local Development)

```bash
# 1. Install dependencies
npm install

# 2. Run unit tests
npm test

# 3. Start development server
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## 3. Automated Tests

```bash
npx tsx --test src/server/tests.test.ts
```

Tests verified:
- Password hashing with `node:crypto` scrypt and timing-safe equality
- Auth token issuance, validation, and instant revocation
- Crockford Base32 pairing code generation (excluding ambiguous characters)
- IP/device rate limiting and 15-minute brute-force lockout
- Single-use code validation and expiration
- Session creation, real byte accounting, and provider killswitch revocation

---

## 4. Key Endpoints

- `POST /api/auth/register` — Register new user account
- `POST /api/auth/login` — Sign in and receive bearer token
- `GET /api/devices` — List fleet devices
- `POST /api/devices/register` — Register device identity & public key
- `DELETE /api/devices/:id` — Revoke device credentials
- `POST /api/pairing/create` — Generate short-lived pairing code (5 min TTL)
- `POST /api/pairing/accept` — Validate code & establish session
- `POST /api/sessions/start` — Start sharing session
- `POST /api/sessions/:id/stop` — Disconnect tunnel
- `POST /api/sessions/:id/revoke` — Provider remote killswitch
- `POST /api/diagnostics/egress-test` — Live external IP & DNS resolution proof
- `GET /api/health` — Regional relay health check
- `WS /ws` — Real-time signaling, ping/pong latency, and tunnel multiplexing
