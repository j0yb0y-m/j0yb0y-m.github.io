---
title: Building a Port Scanner in Go
date: 2026-05-28
readtime: 14
description: Walk through writing a concurrent port scanner using Go's goroutines, wait groups, and worker pools.
tags: go, networking, tools
---

$ cat building-a-port-scanner-in-go.md

### Why Go for Networking Tools?

When writing network tools, performance and concurrency are critical. While Python is fantastic for quick scripting, its Global Interpreter Lock (GIL) makes true parallelism difficult. Go, on the other hand, was built from the ground up for concurrency. 

Go's **goroutines** are incredibly lightweight threads managed by the Go runtime. You can spin up thousands of them with minimal memory overhead, making Go the perfect language for a fast, concurrent port scanner.

### The Basic Concept

A port scanner needs to:
1. Resolve the target hostname to an IP address.
2. Attempt to open a TCP connection to each port in a given range.
3. If the connection succeeds, the port is OPEN. If it times out or is refused, it is CLOSED or FILTERED.
4. Report the results back to the user.

### A Naive Approach (And Why It Fails)

Here's the simplest way to scan ports concurrently:

```go
package main

import (
    "fmt"
    "net"
    "sync"
)

func main() {
    var wg sync.WaitGroup
    for port := 1; port <= 65535; port++ {
        wg.Add(1)
        go func(p int) {
            defer wg.Done()
            addr := fmt.Sprintf("scanme.nmap.org:%d", p)
            conn, err := net.Dial("tcp", addr)
            if err == nil {
                fmt.Printf("[OPEN] %d\n", p)
                conn.Close()
            }
        }(port)
    }
    wg.Wait()
}
```

**The Problem:** This code fires off 65,535 goroutines simultaneously. Your operating system limits the number of file descriptors (network connections) a process can have open at once (often around 1024 on Linux). Firing 65k connections at once will result in a massive flood of "too many open files" errors, and the scan will fail.

### The Solution: Worker Pools

To scan fast without crashing our network stack or OS limits, we need a **Worker Pool**. We create a fixed number of workers (e.g., 100), and feed them ports to scan via a Go `channel`.

Here is a robust, production-ready port scanner:

```go
package main

import (
    "fmt"
    "net"
    "sort"
    "time"
)

func worker(ports, results chan int) {
    for p := range ports {
        address := fmt.Sprintf("scanme.nmap.org:%d", p)
        // 1-second timeout prevents hanging on filtered ports
        conn, err := net.DialTimeout("tcp", address, 1*time.Second)
        if err != nil {
            results <- 0 // 0 means closed/filtered
            continue
        }
        conn.Close()
        results <- p // return the open port
    }
}

func main() {
    ports := make(chan int, 100)
    results := make(chan int)
    var openports []int

    // 1. Start 100 workers
    for i := 0; i < cap(ports); i++ {
        go worker(ports, results)
    }

    // 2. Feed ports to the workers in a separate goroutine
    go func() {
        for i := 1; i <= 1024; i++ {
            ports <- i
        }
    }()

    // 3. Gather results
    for i := 0; i < 1024; i++ {
        port := <-results
        if port != 0 {
            openports = append(openports, port)
        }
    }

    close(ports)
    close(results)

    // 4. Sort and print results
    sort.Ints(openports)
    for _, port := range openports {
        fmt.Printf("Port %d is open\n", port)
    }
}
```

### Next Steps

To turn this into a professional tool, you could:
1. **Add CLI Flags:** Use the `flag` package to accept target IPs, port ranges, and concurrency limits from the command line.
2. **Banner Grabbing:** Once a port is open, send a basic payload (like `GET / HTTP/1.0\r\n\r\n`) and read the response to identify the service.
3. **UDP Scanning:** Implement UDP support, keeping in mind that UDP scanning is inherently slower and less reliable due to its connectionless nature.
