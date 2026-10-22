# NetSetu Architecture Decision Record (ADR)

## 1. System Context & Geographic Scope
- **Provider Location**: Biratnagar, Morang District, Koshi Province, Nepal. Connected via mobile carrier (Ncell 4G/5G or Nepal Telecom - NTC LTE).
- **Receiver Location**: Rajbiraj, Saptari District, Madhesh Province, Nepal (~85 km line-of-sight distance across the Koshi Barrage).
- **Relay/Coordinator**: Kathmandu Regional Data Hub or Cloud instance with low-latency peering to Nepal Internet Exchange (NPIX).

---

## 2. The Core Networking Problem: Cellular CGNAT in Nepal
In Nepal, mobile operators (Ncell and NTC) assign private IPv4 addresses from the RFC 6598 block (`100.64.0.0/10`) to mobile subscribers.
- Inbound TCP/UDP connections to the provider's phone are **strictly dropped** by the carrier's firewall.
- Port forwarding is impossible on mobile cellular data.
- Both the Provider in Biratnagar and the Receiver in Saptari are behind symmetrical or port-restricted NAT.

### Evaluated Architectures

| Architecture | Feasibility on Cellular | Android Non-Root Feasible? | Provider Egress Guaranteed? | Decision |
|---|---|---|---|---|
| **A. Direct P2P via STUN/ICE** | Low (~15% success) | Yes | Yes | Rejected as primary due to symmetric CGNAT port mutation |
| **B. Cloud VPS VPN (WireGuard)** | High | Yes | **NO (Violates Core Rule)** | **REJECTED**: Routes traffic out of the cloud server's IP, which is not the provider's mobile internet. |
| **C. Rooted iptables / TUN Routing** | High | **NO** (Requires unlocked bootloader & root `su`) | Yes | Rejected for standard consumer app; documented as power-user mode. |
| **D. Authenticated Reverse Tunnel + Egress Engine** | **100% Guaranteed** | **YES (Fully Supported)** | **YES (Exits via Provider Phone)** | **SELECTED ARCHITECTURE** |

---

## 3. Selected Architecture: Authenticated Reverse Tunneling

```
[ Client: Saptari ]
   |
   | (1) Android VpnService (tun2socks) OR Desktop SOCKS5/HTTP Proxy
   v
[ Encrypted WSS/TLS Control & Data Channel ]
   |
   | (2) Outbound connection to NetSetu Relay (Kathmandu/Cloud)
   v
[ NetSetu Relay & Signaling Gateway ]
   |
   | (3) Multiplexed Reverse Stream
   v
[ Provider: Biratnagar Mobile Phone ]
   |
   | (4) Android Foreground Egress Engine creates native cellular socket
   v
[ Cellular Carrier Gateway (Ncell/NTC) ]
   |
   | (5) Egress to Public Internet with Provider's Mobile Public IP
   v
[ Public Target Servers (Google, News, Web) ]
```

### Why this satisfies all constraints:
1. **Both peers make outbound connections**: Neither phone needs a public IP or open port.
2. **Provider's phone is the exit node**: Sockets are initiated by the provider phone's cellular network stack. Public websites see the provider's IP (`103.104.148.45`), not the relay VPS IP.
3. **No root required**: Android allows foreground apps to initiate standard TCP/UDP outbound sockets without elevated privileges.
4. **Clean VPN interception on receiver**: Receiver uses Android `VpnService` to capture full-device IP packets without root.
