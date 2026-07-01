---
title: 深入理解 TypeScript 泛型
date: 2025-06-20
tags: [TypeScript, 前端基础]
excerpt: 泛型是 TypeScript 中最强大的特性之一。本文通过实际案例，带你深入理解泛型的使用场景和高级技巧。
---

## 什么是泛型

泛型（Generics）允许我们创建可复用的组件，这些组件可以支持多种类型的数据，同时保持类型安全。

## 基础用法

### 泛型函数

```ts
function identity<T>(arg: T): T {
  return arg;
}

// 使用方式
const num = identity<number>(42);
const str = identity('hello'); // 类型推断
```

### 泛型接口

```ts
interface GenericResponse<T> {
  data: T;
  status: number;
  message: string;
}

const userResponse: GenericResponse<User> = {
  data: { id: 1, name: 'Alice' },
  status: 200,
  message: 'Success',
};
```

## 约束泛型

使用 `extends` 关键字可以约束泛型的类型范围：

```ts
interface HasLength {
  length: number;
}

function logLength<T extends HasLength>(arg: T): T {
  console.log(arg.length);
  return arg;
}

logLength('hello');     // OK: string has length
logLength([1, 2, 3]);   // OK: array has length
logLength(42);          // Error: number doesn't have length
```

## 高级技巧

### 条件类型

```ts
type IsString<T> = T extends string ? true : false;

type A = IsString<'hello'>; // true
type B = IsString<42>;      // false
```

### 映射类型

```ts
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

type Partial<T> = {
  [P in keyof T]?: T[P];
};
```

## 总结

泛型是 TypeScript 类型系统的核心，掌握泛型能够编写出更灵活、更安全的代码。从简单到复杂，逐步探索泛型的各种可能性。

> 类型系统不是用来束缚你的，而是用来帮助你思考的。 —— Anders Hejlsberg
