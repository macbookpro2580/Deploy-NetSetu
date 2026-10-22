# NetSetu Desktop Client Guide (Windows & Linux)

## 1. Quick Start
The Desktop Client enables computers in Saptari (or anywhere) to route internet traffic through the paired Biratnagar mobile provider.

### Running with Node.js / TSX:
```bash
cd desktop-client
npm install
npm start <PAIRING_CODE>
```

Example:
```bash
npm start 9X4K2P
```

---

## 2. Windows 10 / 11 Configuration

### Option A: System Proxy (All Browsers & Store Apps)
1. Open **Windows Settings** -> **Network & Internet** -> **Proxy**.
2. Under **Manual proxy setup**, click **Set up**.
3. Turn **Use a proxy server** ON.
4. Proxy IP address: `127.0.0.1` | Port: `8080`.
5. Click **Save**.

Or configure instantly via Command Prompt (Admin):
```cmd
netsh winhttp set proxy 127.0.0.1:8080
```

To reset back to direct internet:
```cmd
netsh winhttp reset proxy
```

### Option B: Firefox / Chrome SOCKS5 Proxy
In browser settings, set Manual Proxy Configuration:
- SOCKS Host: `127.0.0.1`
- Port: `1080`
- Select **SOCKS v5**
- Check: **Proxy DNS when using SOCKS v5** (prevents DNS leaks).

---

## 3. Linux Configuration (Ubuntu / Debian / Fedora)

### Command-Line Environment Variables:
```bash
export all_proxy="socks5://127.0.0.1:1080"
export http_proxy="http://127.0.0.1:8080"
export https_proxy="http://127.0.0.1:8080"
```

Verify egress IP:
```bash
curl ifconfig.me
# Output will display the Biratnagar Ncell mobile IP!
```
