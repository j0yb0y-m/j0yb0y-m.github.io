---
title: Setting Up a Home Lab for Pentesting
date: 2026-03-22
readtime: 7
description: How to build a virtualized pentesting lab with vulnerable machines, network segmentation, and monitoring.
tags: homelab, pentesting, virtualization
---

$ cat setting-up-a-home-lab.md

### Why a Home Lab?

A home lab lets you practice pentesting legally, test exploits safely, and build your skills without risking real systems.

### Recommended Setup

- **Hypervisor:** VMware Workstation or VirtualBox
- **Attack Machine:** Kali Linux or Parrot OS
- **Targets:** Metasploitable 2/3, DVWA, VulnHub VMs, HackTheBox
- **Network:** NAT network with a separate host-only network for the lab

### Lab Network Layout

```
[Internet]
    |
[Kali Linux] --- (NAT) --- [Router]
    |
    +--- [Metasploitable] (host-only: 192.168.56.x)
    +--- [Windows Target] (host-only)
    +--- [Ubuntu Server]  (host-only)
```

### Useful Tools to Install

- Burp Suite Community Edition
- Nmap, Masscan
- Metasploit Framework
- Responder, Impacket
- BloodHound (for AD labs)
