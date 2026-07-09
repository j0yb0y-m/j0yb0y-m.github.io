---
title: Linux Privilege Escalation Basics
date: 2026-04-10
readtime: 6
description: Common misconfigurations and kernel exploits used to escalate from low-priv to root on Linux.
tags: linux, privilege-escalation, pentesting
---

$ cat linux-privesc-basics.md

### Enumerate First

Run these to understand the target:

```bash
uname -a
cat /etc/os-release
sudo -l
ls -la /etc/passwd /etc/shadow
find / -perm -4000 2>/dev/null
cat /etc/crontab
ss -tuln
```

### Common Vectors

- **SUID Binaries** — Find binaries with the SUID bit that can be exploited
- **Sudo Misconfigurations** — Check if you can run commands as root without a password
- **Kernel Exploits** — Old kernels may have known privilege escalation exploits
- **Cron Jobs** — Writable scripts executed by root

### Automation Tools

- **LinPEAS** — Comprehensive enumeration script
- **GTFOBins** — Exploitable SUID binaries reference
- **Linux Exploit Suggester** — Checks kernel version against known exploits
