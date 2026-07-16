---
title: Setting Up a Home Lab for Pentesting
date: 2026-03-22
readtime: 12
description: How to build a virtualized pentesting lab with vulnerable machines, network segmentation, and monitoring.
tags: homelab, pentesting, virtualization
---

$ cat setting-up-a-home-lab.md

### Why Build a Home Lab?

A home lab lets you practice pentesting legally, test exploits safely, and build your skills without risking real production systems. It's an isolated playground where you have full control over the network architecture, operating systems, and security configurations. Reading about Active Directory exploitation is great, but actually executing a Kerberoasting attack on your own network cements the knowledge.

### Recommended Setup & Hypervisors

You don't need a massive server rack to get started. A decent laptop with 16GB of RAM and a modern multi-core CPU is plenty.

- **Hypervisor:** VMware Workstation Pro (now free for personal use) or VirtualBox. Proxmox is fantastic if you have a dedicated bare-metal server.
- **Attack Machine:** Kali Linux or Parrot OS.
- **Targets:** Metasploitable 2/3, DVWA (Damn Vulnerable Web App), VulnHub VMs, and Windows Evaluation ISOs for Active Directory labs.

### Lab Network Architecture

The most critical part of a home lab is **Network Segmentation**. You absolutely do NOT want vulnerable machines exposed to your home network (or the internet).

We achieve this by using a **Host-Only Network** (or a dedicated VLAN if you're using Proxmox/ESXi) for the targets, and a **NAT Network** for your attack machine if it needs internet access.

```text
[Internet]
    |
[Host Machine (Your PC)]
    |
    +--- (NAT Network: 10.0.2.x) --- [Kali Linux]
    |                                   | (2nd NIC)
    +--- (Host-Only: 192.168.56.x) -----+
                                        |
                                        +--- [Metasploitable 2]
                                        +--- [Windows Server (DC)]
                                        +--- [Windows 10 (Client)]
```

*Note: Your Kali VM will have two network interfaces. One connected to the NAT network for internet access (installing tools), and one connected to the Host-Only network to attack the vulnerable VMs.*

### Essential Vulnerable Targets

1. **Metasploitable 2:** The classic starting point. It's an intentionally vulnerable Ubuntu Linux virtual machine designed for testing security tools and practicing common penetration testing techniques.
2. **Active Directory Lab:** Download the Windows Server 2022 Evaluation ISO. Promote it to a Domain Controller. Then attach a Windows 10 client. This allows you to practice BloodHound, Impacket, and Mimikatz.
3. **OWASP Juice Shop:** A modern web application riddled with security flaws. You can run this easily via Docker on a Ubuntu Server VM.

```bash
# Running Juice Shop via Docker
sudo docker run --rm -p 3000:3000 bkimminich/juice-shop
```

### Useful Tools to Install

Once your lab is running, ensure your attack machine is equipped with the essentials:

- **Burp Suite Community Edition:** For web application testing.
- **Nmap & Masscan:** For network discovery and port scanning.
- **Metasploit Framework:** For exploitation and post-exploitation.
- **Responder & Impacket:** Essential for Active Directory and Windows environments.
- **BloodHound:** For mapping out AD trust relationships and attack paths.

Building a home lab is an ongoing project. Start small with one or two VMs, and gradually introduce more complex scenarios like firewalls (pfSense) and monitoring (Splunk/ELK) as you grow!
