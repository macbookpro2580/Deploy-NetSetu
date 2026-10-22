# NetSetu Security & Privacy Architecture

## 1. Threat Model & Security Posture
NetSetu is designed to allow consensual internet sharing without turning the provider's phone into an open relay or exposing the receiver's unencrypted traffic to eavesdroppers.

### Key Threats & Mitigations

| Threat | Mitigation Mechanism |
|---|---|
| **Unauthorized Peer Access** | Cryptographic 6-character Crockford Base32 single-use pairing codes; 5-minute TTL; explicit Provider approval push required before tunnel establishment. |
| **Brute-Force & Code Guessing** | Strict IP and device-rate limiting: 5 failed attempts trigger an automatic 15-minute lockout. |
| **Man-in-the-Middle (MitM)** | All signaling and data channels use TLS 1.3 with certificate pinning or authenticated WSS. |
| **Provider Abuse / Open Relay** | Provider retains absolute sovereignty: one-click killswitch immediately terminates all active sockets and revokes client tokens. |
| **Privacy / Browsing Content Logging** | Zero payload logging. NetSetu database records only connection timestamps, byte counters, and device authorization IDs. Zero URLs or packet payloads are recorded. |
| **DNS Leaks** | DNS queries are explicitly forced through Cloudflare (`1.1.1.1`) over the tunnel via the Provider's mobile stack. |

---

## 2. Replay Protection & Ephemeral Sessions
1. Each pairing invitation contains a 192-bit cryptographic secret (`secretToken`).
2. When approved, a unique session token (`nst_ses_...`) is minted with strict single-device binding.
3. If a provider revokes a device or disconnects, the session state is updated server-side and the WebSocket channel is immediately severed.
