---
title: Tailwind CSS 实战：从零搭建设计系统
date: 2025-06-15
tags: [Tailwind CSS, UI设计, CSS]
excerpt: Tailwind CSS 不仅是一个工具类框架，更是一个构建设计系统的强大工具。本文分享如何在项目中系统化地使用 Tailwind。
---

## 为什么选择 Tailwind CSS

Tailwind CSS 采用工具类优先（Utility-First）的方法，让开发者能够快速构建现代界面，同时保持代码的可维护性。

## 配置设计令牌

通过 `tailwind.config.js` 自定义设计令牌：

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          500: '#0ea5e9',
          900: '#0c4a6e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
      },
    },
  },
};
```

## 组件封装模式

### 1. 工具类组件

```tsx
function Button({ children, variant = 'primary' }) {
  const base = 'px-4 py-2 rounded font-medium transition-colors';
  const variants = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
  };
  return <button className={`${base} ${variants[variant]}`}>{children}</button>;
}
```

### 2. @apply 提取（不推荐在组件中过度使用）

```css
@layer components {
  .card {
    @apply bg-white rounded-lg shadow-md p-6;
  }
}
```

## 响应式设计

Tailwind 的响应式前缀让响应式设计变得简单：

```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <div class="p-4">Item 1</div>
  <div class="p-4">Item 2</div>
  <div class="p-4">Item 3</div>
</div>
```

## 最佳实践

- 避免在 HTML 中堆砌过多类名
- 使用组件封装重复模式
- 利用 IntelliSense 插件提高开发效率
- 按需引入，避免生产环境包含未使用的样式

## 总结

Tailwind CSS 改变了我们写 CSS 的方式，从"写样式"变成"组合样式"。掌握这种新的思维方式，能够大幅提升前端开发效率。
