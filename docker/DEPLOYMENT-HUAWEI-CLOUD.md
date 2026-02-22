# Huawei Cloud Deployment Guide

This document provides step-by-step instructions for deploying ChatbotAI on Huawei Cloud. **Cursor and other AI assistants should follow this guide** to avoid hallucinating deployment steps.

---

## What's next? (Quick sequence)

| Step | Where | Action |
|------|--------|--------|
| 1 | **Project root** (e.g. `D:\Projects\ChatbotAI`) | `docker build -t anything-llm:latest -f docker/Dockerfile .` |
| 2 | SWR Console | Create organization (e.g. `my-org`). Note region and org name. |
| 3 | Terminal (project root) | `docker login -u <region>@<AK> -p <SK> swr.<region>.myhuaweicloud.com` |
| 4 | Terminal | `docker tag` then `docker push` (see Section 3). |
| 5 | ECS (SSH) | Same `docker login`, then `docker pull` and `docker run` with the SWR image URL. |

**Important:** Always run `docker build` from the **project root** (parent of `docker/`), not from inside the `docker` folder. The build context (the `.`) must be the project root.

---

## 1. Prepare the Project

You can do these steps **on your local machine** (then push the image to SWR) or **on a Huawei Cloud ECS instance** (e.g. after creating one in Section 2/4).

### Node.js
- Ensure you use **Node.js 18+** (the app expects this). On ECS: `node -v` (install Node only if you are building the image on ECS; for run-only you just need Docker).

### Docker
Confirm the image builds and runs.

**1. From project root, build:**
   ```bash
   docker build -t anything-llm:latest -f docker/Dockerfile .
   ```

**2. Run the container**

- **Local (for testing):**
   ```bash
   docker run -d --name anything-llm -p 3001:3001 -v ./server/storage:/app/server/storage -v ./server/.env:/app/server/.env anything-llm:latest
   ```

- **On Huawei Cloud ECS** (use persistent paths; create dirs and `.env` first—see Section 4):
   ```bash
   sudo mkdir -p /data/anythingllm/storage /data/anythingllm/documents /data/anythingllm/vector-cache
   # Create /data/anythingllm/.env with your config, then:
   docker run -d --name anything-llm \
     -p 3001:3001 \
     -v /data/anythingllm/storage:/app/server/storage \
     -v /data/anythingllm/documents:/app/server/documents \
     -v /data/anythingllm/vector-cache:/app/server/vector-cache \
     -v /data/anythingllm/.env:/app/server/.env \
     --restart unless-stopped \
     anything-llm:latest
   ```
   (Replace `anything-llm:latest` with your SWR image if you pulled from SWR.)

**3. Verify:** Open http://localhost:3001 (local) or **http://&lt;EIP&gt;:3001** (Huawei Cloud).

### Environment
- Keep `.env` (and any secrets) **out of the image**.
- Use Huawei Cloud config (see below) or a secure store for secrets.

### Data
- The app uses `server/storage` and SQLite.
- Plan to persist these (e.g. host path or cloud disk) so data survives restarts.
- Also consider persisting `server/documents` and `server/vector-cache` if you use document RAG and LanceDB.

---

## 2. Huawei Cloud Account and Resources

### Account
- Sign up at [Huawei Cloud](https://www.huaweicloud.com).
- Complete identity verification if required by your region.

### Create / Note These Services
(Console or API)

| Service | Purpose |
|---------|---------|
| **SWR** (Software Repository for Containers) | Store your Docker image |
| **ECS** (Elastic Cloud Server) | Run the container (simplest) |
| **CCE** (Cloud Container Engine) | Alternative: Kubernetes |
| **EVS** (Elastic Volume Service) | Disk for persistent data (e.g. `server/storage`) |
| **EIP** (Elastic IP) | Public IP for the ECS or load balancer |
| **VPC & Security Group** | Network and firewall (open port **3001** for the app) |

---

## 3. Build and Push the Docker Image to Huawei SWR

### Install Huawei Cloud CLI (optional)
- Install the CLI and run `hcloud configure` (AK/SK, region, etc.).

### Log in to SWR (Docker login)
1. In SWR Console, create an organization (e.g. `my-org`).
2. Get the SWR login command or use:
   - Region endpoint example: `swr.<region>.myhuaweicloud.com`
   - **Use the region ID, not the console display name.** Example: AP-Bangkok → `ap-southeast-1` (lowercase, hyphens).
   - Login:
     ```bash
     docker login -u <region>@<AK> -p <SK> swr.<region>.myhuaweicloud.com
     ```
   - Use your **AK** as username and **SK** as password (as shown in SWR).

### Build the Image
From your **project root**:

```bash
docker build -t anything-llm:latest -f docker/Dockerfile .
```

**If push to SWR fails with "Invalid image, fail to parse 'manifest.json'":**  
Docker BuildKit can attach provenance/SBOM metadata that some registries (including Huawei SWR) do not accept. Rebuild with attestations disabled, then tag and push again:

```bash
docker build --provenance=false -t anything-llm:latest -f docker/Dockerfile .
```

### Tag and Push to SWR

```bash
docker tag anything-llm:latest swr.<region>.myhuaweicloud.com/<organization>/anything-llm:latest
docker push swr.<region>.myhuaweicloud.com/<organization>/anything-llm:latest
```

Use the **same region** where you will run ECS/CCE.

---

## 4. Run the App on ECS (Recommended for a Single Instance)

### Create an ECS Instance
- **Image**: Use a Huawei Cloud Linux or Ubuntu image that supports Docker (or a “Docker” image if available in your region).
- **Specs**: At least **2 vCPUs**, **4 GB RAM** (increase if you use heavy embedding/LLM workloads).
- **Region**: Use the **same region** as your SWR image (e.g. **ap-southeast-2**). This avoids cross-region pull latency and extra cost.
- **Network**: Attach to your VPC and subnet; assign or bind an **EIP** so the server is reachable from the internet.
- **Security group**: Inbound allow **TCP 3001** (app) and **TCP 22** (SSH).

### Install Docker on ECS

If `docker` is not installed, you will see `docker: command not found` when running `docker ps` or `docker run`. Install Docker on the ECS first, then continue with Section 4.1 (login, pull, run).

**Check if Docker is installed:**

```bash
docker --version
```

If that fails, install Docker using one of the following, depending on your ECS OS.

#### Option A: CentOS / RHEL / Euler (yum or dnf)

```bash
# Install yum-utils (for yum-config-manager)
sudo yum install -y yum-utils

# Add the official Docker CE repository
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo

# Install Docker Engine and start the service
sudo yum install -y docker-ce docker-ce-cli containerd.io
sudo systemctl start docker
sudo systemctl enable docker

# Confirm
docker --version
```

#### Option B: Huawei Cloud EulerOS 2.0 (HCE) — use HCE repos

Do **not** use the Docker CE CentOS repo on EulerOS; the OS version is reported as `2.0`, which leads to a 404. Use the built-in HCE (Huawei Cloud EulerOS) repositories instead.

If you already added the Docker CE repo, remove it to avoid conflicts:

```bash
sudo rm -f /etc/yum.repos.d/docker-ce.repo
```

Then install Docker from the HCE repos and start it:

```bash
sudo dnf install -y docker
sudo systemctl start docker
sudo systemctl enable docker
docker --version
```

Prerequisite: the HCE yum/dnf repository must be configured (default HCE images usually have `/etc/yum.repos.d/hce.repo`). If `dnf install docker` fails with "no package docker", see [Huawei: Configuring HCE Repositories](https://support.huaweicloud.com/intl/en-us/usermanual-hce/hce_repo.html).

#### Option C: Ubuntu / Debian (apt)

```bash
# Update and install prerequisites
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg

# Add Docker's official GPG key and repo
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install and start Docker
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io
sudo systemctl start docker
sudo systemctl enable docker

# Confirm
docker --version
```

After Docker is installed, continue with **Section 4.1, Step 2** (docker login), then Step 3 (dirs and .env), Step 4 (pull), and Step 5 (run).

### Persistent Storage
1. Create an **EVS disk** and attach it to the ECS.
2. Mount it, e.g. at `/data/anythingllm`.
3. Use that for `server/storage` (and SQLite), `documents`, and `vector-cache`.

---

### 4.1. Step-by-step: SSH, login, prepare dirs, pull, and run (ap-southeast-2)

Do these steps **on the ECS** after you have:
- An ECS in region **ap-southeast-2** (or your SWR region).
- Your **Access Key (AK)** and **Secret Key (SK)** from IAM.
- Your SWR **organization** name (e.g. `my-org`).

#### Step 1: SSH into the ECS

From your local machine:

```bash
ssh root@<ECS_EIP>
```

Or with a key and user:

```bash
ssh -i /path/to/your-key.pem <username>@<ECS_EIP>
```

Replace `<ECS_EIP>` with the Elastic IP (or private IP if you use a bastion) of your ECS. Ensure port 22 is allowed in the security group.

#### Step 2: Log in to SWR from the ECS (Docker login with AK/SK)

On the ECS, run the same login as on your local machine. Use the **region ID** (e.g. `ap-southeast-2`), **AK** as the username part, and **SK** as the password.

```bash
docker login -u ap-southeast-2@<YOUR_AK> -p <YOUR_SK> swr.ap-southeast-2.myhuaweicloud.com
```

- Replace `<YOUR_AK>` with your Huawei Cloud Access Key.
- Replace `<YOUR_SK>` with your Huawei Cloud Secret Key.
- For another region, replace `ap-southeast-2` in both the username and the registry host (e.g. `ap-southeast-1` for Bangkok).

You should see: `Login Succeeded`.

#### Step 3: Create directories and `.env` on the ECS (if not already done)

Create the directories that will be mounted into the container:

```bash
sudo mkdir -p /data/anythingllm/storage
sudo mkdir -p /data/anythingllm/documents
sudo mkdir -p /data/anythingllm/vector-cache
```

The container runs as user `anythingllm` (UID 1000, GID 1000). So the app must be able to create files (e.g. the SQLite DB) in these directories. After creating them, set ownership:

```bash
sudo chown -R 1000:1000 /data/anythingllm/storage /data/anythingllm/documents /data/anythingllm/vector-cache
```

Create the `.env` file that the app will use (LLM keys, auth, etc.):

```bash
sudo nano /data/anythingllm/.env
```

Add at least (adjust values to your environment). **Required in Docker:** the app expects `STORAGE_DIR` in production (path inside the container).

```env
AUTH_TOKEN=your-single-user-password
# Or for multi-user:
# JWT_SECRET=your-jwt-secret

NODE_ENV=production
SERVER_PORT=3001
STORAGE_DIR=/app/server/storage

# Chat LLM (e.g. DeepSeek): set in General Settings → LLM Preference, or here:
# LLM_PROVIDER=generic-openai
# GENERIC_OPEN_AI_BASE_PATH=https://api.deepseek.com
# GENERIC_OPEN_AI_API_KEY=your-deepseek-key   # from https://platform.deepseek.com (do not use Aliyun key)
# Note: Opening https://api.deepseek.com in a browser shows "Authentication Fails (governor)" — that is expected; the API is used by the app with your key, not in the browser.
```

Save and exit (in nano: `Ctrl+O`, Enter, then `Ctrl+X`). Ensure the file is readable by the user that runs Docker (e.g. `chmod 600 /data/anythingllm/.env` if needed).

#### Step 4: Pull the image from SWR

Pull the image using the **full SWR URL** (same region and organization as in Section 3):

```bash
docker pull swr.ap-southeast-2.myhuaweicloud.com/<organization>/anything-llm:latest
```

Replace `<organization>` with your SWR organization name (e.g. `my-org`). Example:

```bash
docker pull swr.ap-southeast-2.myhuaweicloud.com/my-org/anything-llm:latest
```

#### Step 5: Run the container

If a container named `anything-llm` already exists from a previous run, remove it first:

```bash
docker stop anything-llm 2>/dev/null; docker rm anything-llm 2>/dev/null
```

Then run:

```bash
docker run -d --name anything-llm -p 3001:3001 \
  -v /data/anythingllm/storage:/app/server/storage \
  -v /data/anythingllm/documents:/app/server/documents \
  -v /data/anythingllm/vector-cache:/app/server/vector-cache \
  -v /data/anythingllm/.env:/app/server/.env \
  --restart unless-stopped \
  swr.ap-southeast-2.myhuaweicloud.com/<organization>/anything-llm:latest
```

Replace `<organization>` with your SWR organization (e.g. `my-org`). Example:

```bash
docker run -d --name anything-llm -p 3001:3001 \
  -v /data/anythingllm/storage:/app/server/storage \
  -v /data/anythingllm/documents:/app/server/documents \
  -v /data/anythingllm/vector-cache:/app/server/vector-cache \
  -v /data/anythingllm/.env:/app/server/.env \
  --restart unless-stopped \
  swr.ap-southeast-2.myhuaweicloud.com/my-org/anything-llm:latest
```

- **-d**: run in background.
- **-p 3001:3001**: expose app port 3001.
- **-v ...**: persist storage, documents, vector-cache, and `.env` on the host.
- **--restart unless-stopped**: restart the container after reboot or crash.

#### Step 6: Check that the container is running

```bash
docker ps
```

You should see `anything-llm` with status "Up". View logs if needed:

```bash
docker logs -f anything-llm
```

### Verify
Open **http://<EIP>:3001** in a browser (replace `<EIP>` with your ECS Elastic IP).

---

### 4.1.1. How to log in (step-by-step)

The app shows a **single password** field when in **single-user mode**. That password is the value of `AUTH_TOKEN` in the server’s `.env`. Follow these steps to set it and log in.

#### Part A: Set the login password on the server (one-time)

**If the app is on Huawei Cloud ECS (Docker):**

1. **SSH into the ECS** (see Section 4.1, Step 1).
2. **Open the `.env` file** used by the container:
   ```bash
   sudo nano /data/anythingllm/.env
   ```
3. **Add or edit this line** (use a strong password; no quotes needed unless it contains spaces):
   ```env
   AUTH_TOKEN=your-chosen-password
   ```
   If you use single-user auth, you also need a JWT secret (see `docker/.env.example`). Example:
   ```env
   AUTH_TOKEN=your-chosen-password
   JWT_SECRET=your-random-string-at-least-12-chars
   ```
4. **Save and exit** (nano: `Ctrl+O`, Enter, then `Ctrl+X`).
5. **Restart the container** so it loads the new env:
   ```bash
   docker restart anything-llm
   ```
6. Wait a few seconds, then go to **Part B** to log in in the browser.

**If the app runs locally with Docker:**

1. Open the `.env` file the container uses (e.g. `server/.env` or the path you mount with `-v`).
2. Add or set:
   ```env
   AUTH_TOKEN=your-chosen-password
   JWT_SECRET=your-random-string-at-least-12-chars
   ```
3. Restart the container (e.g. `docker restart anything-llm` or stop and run `docker run ...` again).
4. Go to **Part B**.

**If the app runs locally with Node (e.g. `yarn start` in `server/`):**

1. Open `server/.env` (or `server/.env.development` in dev).
2. Add or set:
   ```env
   AUTH_TOKEN=your-chosen-password
   JWT_SECRET=your-random-string-at-least-12-chars
   ```
3. Restart the server (stop and run `yarn start` again).
4. Go to **Part B**.

#### Part B: Log in in the browser (every time)

1. Open the app in a browser: **http://&lt;EIP&gt;:3001** (Huawei) or **http://localhost:3001** (local).
2. You should see the **ChatbotAI** login page with one **Password** field.
3. In **Password**, type **exactly** the value you set for `AUTH_TOKEN` (e.g. `your-chosen-password`). It is case-sensitive.
4. Click **Login**.
5. If you see **"Error: Could not validate login."**:
   - The password does not match `AUTH_TOKEN`, or
   - `AUTH_TOKEN` is not set or not loaded (e.g. wrong `.env` or container not restarted).
   - Fix the `.env` on the server and restart the app, then try again.

**Summary:** Login password = `AUTH_TOKEN` from the server’s `.env`. Set it once on the server, restart the app, then use that same string in the browser Password field.

---

### 4.2. Troubleshooting: "This site can't be reached" / ERR_CONNECTION_REFUSED

If the browser shows **ERR_CONNECTION_REFUSED** at `http://<EIP>:3001`, run these checks **on the ECS** (e.g. in CloudShell or SSH).

#### 1. Is the container running?

```bash
docker ps -a
```

- If `anything-llm` is **missing**: the container was never created or was removed. Run the `docker run` command again (Section 4.1, Step 5).
- If status is **Exited** or **Restarting**: the container crashed. Check logs:
  ```bash
  docker logs anything-llm
  ```
  Fix the cause (e.g. bad `.env`, missing storage dir, out-of-memory) then:
  ```bash
  docker start anything-llm
  ```

#### 2. Is port 3001 listening on the host?

```bash
ss -tlnp | grep 3001
# or: netstat -tlnp | grep 3001
```

You should see something like `0.0.0.0:3001` (or `*:3001`). If nothing appears, the container may not be running or the port is not bound.

#### 3. Huawei Cloud security group (firewall)

- In **Huawei Cloud Console** → **ECS** → your instance → **Security Group** (or VPC → Security Groups).
- Ensure an **inbound rule** allows **TCP port 3001** from `0.0.0.0/0` (or your IP) so the EIP is reachable on 3001.
- Also allow **TCP 22** if you use SSH/CloudShell.

#### 4. Host firewall (firewalld / iptables)

If the ECS uses **firewalld**:

```bash
sudo firewall-cmd --list-ports
sudo firewall-cmd --permanent --add-port=3001/tcp
sudo firewall-cmd --reload
```

If you use **iptables**, ensure no rule is dropping traffic to port 3001.

#### 5. Test from the ECS itself

```bash
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3001
```

- If you get `200` or `302`: the app is listening; the problem is likely **security group** or **host firewall** (steps 3–4).
- If **connection refused**: container not running, or app inside the container not binding to `0.0.0.0:3001`; check `docker logs anything-llm` and container status.

After fixing, reload **http://<EIP>:3001** in the browser.

---

## 5. Optional: Run on CCE (Kubernetes)

1. Create a **CCE cluster** (managed Kubernetes) in the same region as SWR.

2. Create a **Deployment** that uses the image:
   ```
   swr.<region>.myhuaweicloud.com/<organization>/anything-llm:latest
   ```

3. Add a **Service** (e.g. NodePort or LoadBalancer) exposing port **3001**.

4. Use a **PersistentVolumeClaim** for `server/storage` and mount it in the pod at `/app/server/storage`.

5. Put env/config in **ConfigMap/Secret** and mount as `/app/server/.env` or inject as env vars.

6. Optionally put an **Ingress + ELB** in front and use a domain and HTTPS.

---

## 6. Post-Deployment

| Task | Action |
|------|--------|
| **Backups** | Back up the EVS volume (or PVC) that holds `server/storage` and the SQLite DB (e.g. Huawei Cloud Backup or snapshots). |
| **Secrets** | Store API keys (LLM, etc.) in **Huawei Cloud DEW** (Data Encryption Workshop) or env/ConfigMap/Secret—**not** in the image or in code. |
| **Monitoring** | Use **Cloud Eye (LTS)** for ECS/CCE metrics and alarms (CPU, memory, disk). |
| **Domain & HTTPS** | If you use a domain, bind it to the EIP or ELB and configure SSL (e.g. certificate in ELB or via Ingress). |

---

## Summary Checklist

| Step | Activity |
|------|----------|
| 1 | Prepare app (Node 18+, Docker build, env and storage plan). |
| 2 | Create Huawei Cloud account; create VPC, security group, EIP. |
| 3 | Create SWR organization; build image, tag, push to SWR. |
| 4 | Create ECS (or CCE); install Docker on ECS if needed. |
| 5 | Attach EVS and mount for `server/storage`. |
| 6 | Configure `.env` (from host or DEW/Secret). |
| 7 | Run container with port 3001 and volume mounts; open EIP:3001. |
| 8 | Set up backups, monitoring, and optional domain/HTTPS. |

---

## Region and Product Names

If you prefer **ECS + Docker** or **CCE (Kubernetes)** and specify your region (e.g. `ap-southeast-1`), this guide can be narrowed to exact product names and a minimal run command for your case.

---

## Important Paths

| Path in Container | Purpose |
|-------------------|---------|
| `/app/server/.env` | App config (LLM keys, JWT_SECRET, etc.) |
| `/app/server/storage` | SQLite DB and app data |
| `/app/server/documents` | Uploaded documents (RAG) |
| `/app/server/vector-cache` | LanceDB vector storage |
