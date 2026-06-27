# Typst Formula

在思源笔记公式面板中直接输入 Typst 数学语法，自动转为 LaTeX 渲染。

## 安装

从 [Releases](../../releases) 下载 `package.zip`，在思源设置 → 插件 → 从 ZIP 导入。

或手动构建：

```bash
git clone https://github.com/wlnyx/siyuan-typst-formula.git
cd siyuan-typst-formula
npm install
npm run build
# 将 dist/ 复制到思源 data/plugins/siyuan-typst-formula/
```

## 使用

1. 点击工具栏公式按钮（或 `/` 菜单插入公式）
2. 公式面板中出现 **LaTeX | Typst** 切换开关
3. 切换到 **Typst** 模式（插件会记住你的选择）
4. 直接输入 Typst 数学语法，例如：`sum_(i=1)^n i`
5. 点击确认，自动转为 `\sum_{i=1}^{n} i`，由 KaTeX 渲染

## 原理

使用 [tex2typst](https://github.com/qwinsi/tex2typst) 的 `typst2tex()` 函数，在思源读取公式值时实时转换。纯 JS 实现，无需 WASM，不依赖 CDN。

## License

GPL-3.0
