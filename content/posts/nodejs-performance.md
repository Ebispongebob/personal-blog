---
title: Node.js 性能优化：从理论到实践
date: 2025-06-10
tags: [Node.js, 后端开发, 性能优化]
excerpt: Node.js 应用在高并发场景下容易遇到性能瓶颈。本文从事件循环、内存管理、异步编程等角度深入分析性能优化策略。
---

## Node.js 事件循环

Node.js 的核心是事件循环（Event Loop）。理解事件循环是进行性能优化的基础。

```
   ┌───────────────────────────┐
┌─>│           timers            │
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │     pending callbacks       │
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │       idle, prepare         │
│  └─────────────┬─────────────┘      ┌───────────────┐
│  ┌─────────────┴─────────────┐      │   incoming:   │
│  │           poll              │<─────┤  connections, │
│  └─────────────┬─────────────┘      │   data, etc.  │
│  ┌─────────────┴─────────────┐      └───────────────┘
│  │           check             │
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
└──┤      close callbacks      │
   └───────────────────────────┘
```

## 异步编程优化

### 使用 Promise.all 并行执行

```js
// 慢：串行执行
const user = await getUser(id);
const posts = await getPosts(id);
const comments = await getComments(id);

// 快：并行执行
const [user, posts, comments] = await Promise.all([
  getUser(id),
  getPosts(id),
  getComments(id),
]);
```

### 避免回调地狱

```js
// 使用 async/await 替代嵌套回调
async function fetchData() {
  try {
    const data = await fetch('/api/data');
    return await data.json();
  } catch (error) {
    console.error('Fetch failed:', error);
  }
}
```

## 内存管理

### 监控内存使用

```js
setInterval(() => {
  const usage = process.memoryUsage();
  console.log({
    rss: `${(usage.rss / 1024 / 1024).toFixed(2)} MB`,
    heapUsed: `${(usage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
  });
}, 5000);
```

### 避免内存泄漏

- 及时清理事件监听器
- 避免闭包引用大对象
- 注意 Buffer 的正确使用

## 集群模式

利用多核 CPU：

```js
const cluster = require('cluster');
const os = require('os');

if (cluster.isMaster) {
  const cpuCount = os.cpus().length;
  for (let i = 0; i < cpuCount; i++) {
    cluster.fork();
  }
} else {
  require('./app');
}
```

## 总结

性能优化是一个持续的过程。关键在于理解系统瓶颈所在，然后针对性地进行优化。不要盲目优化，先测量，再优化。

> 过早优化是万恶之源。 —— Donald Knuth
