---
title: Building a Port Scanner in Go
date: 2026-05-28
readtime: 8
description: Walk through writing a concurrent port scanner using Go's goroutines and net package.
tags: go, networking, tools
---

$ cat building-a-port-scanner-in-go.md

### Why Go?

Go's concurrency model makes it ideal for port scanning. Goroutines let us scan hundreds of ports simultaneously with minimal overhead.

### Basic Structure

A port scanner needs to:

1. Resolve the target hostname to an IP
2. Open a TCP connection to each port
3. Report which ports are open

### Simple Example

```go
package main

import (
    "fmt"
    "net"
    "sync"
)

func scanPort(host string, port int, wg *sync.WaitGroup) {
    defer wg.Done()
    addr := fmt.Sprintf("%s:%d", host, port)
    conn, err := net.Dial("tcp", addr)
    if err != nil {
        return
    }
    conn.Close()
    fmt.Printf("[OPEN] %d\n", port)
}

func main() {
    var wg sync.WaitGroup
    for port := 1; port <= 1024; port++ {
        wg.Add(1)
        go scanPort("scanme.nmap.org", port, &wg)
    }
    wg.Wait()
}
```

### Improvements

Add a worker pool to limit concurrency, timeout handling, and service detection via banner grabbing.
