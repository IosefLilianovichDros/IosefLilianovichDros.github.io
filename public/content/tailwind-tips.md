---
title: "Tailwind CSS 实战技巧"
date: "2024-05-02"
description: "掌握 JIT 模式、组件提取以及响应式设计的核心秘籍。"
tags: ["CSS", "Tailwind"]
---

# Tailwind CSS 实战技巧

Tailwind CSS 已经成为现代前端开发的标准。但仅仅会用 `flex` 和 `p-4` 是不够的，掌握高级技巧能让你的开发效率翻倍。

## 1. 任意值写法 (JIT Mode)

不需要在配置文件里定义每一个颜色，可以直接使用 `bg-[#hex]`：

```html
<div class="bg-[#123456] w-[123px] h-[45.5px]">
  自定义像素或颜色
</div>
```

## 2. 组件提取与封装

不要为了“复用”而到处使用 `@apply`。更推荐的做法是利用 React 组件：

```tsx
const PrimaryButton = ({ children }) => (
  <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
    {children}
  </button>
);
```

## 3. 响应式与暗色模式

Tailwind 的修饰符系统让响应式开发变得异常简单：

```html
<div class="p-4 md:p-8 lg:p-12 dark:bg-slate-900 dark:text-white">
  在不同设备和模式下完美呈现
</div>
```

这就是 Tailwind 的魅力所在——你永远不需要离开 HTML 文件去调整样式。