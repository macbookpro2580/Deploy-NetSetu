# NetSetu Deployment & Infrastructure Guide

This guide describes how to run NetSetu in local development, on a Docker host, or on a Linux cloud server (Ubuntu 22.04 / Debian 12).

---

## 1. Local Development (Current Environment)
To run NetSetu locally:

```bash
# 1. Install dependencies
npm install

# 2. Run unit tests
npm test

# 3. Start full-stack development server on port 3000
npm run dev
```

Visit `http://localhost:3000` in your web browser.

---

## 2. Docker & Container Deployment
NetSetu includes a multi-stage Docker build producing an unprivileged, secure container.

### Running with Docker Compose:
```bash
docker compose up -d --build
```

### Checking Container Health:
```bash
curl http://localhost:3000/api/health
```

---

## 3. Production Deployment with Nginx & Let's Encrypt TLS

### Nginx Reverse Proxy Configuration:
```nginx
server {
    server_name relay.netsetu.np;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### TLS Certificate:
```bash
sudo certbot --nginx -d relay.netsetu.np
```

---

## 4. Cost & Hosting Analysis
- **Relay Server Requirement**: 1 vCPU, 1 GB RAM, 100 Mbps uplink (e.g. DigitalOcean $4/mo or Hetzner €3.50/mo).
- **Bandwidth Consumption**: Traffic is routed through the relay between Saptari and Biratnagar. With 50 GB monthly transfer, costs remain well within typical free provider allowances (1,000 GB+ included).
