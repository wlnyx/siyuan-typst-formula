# Typst Formula — SiYuan Plugin

Type Typst math in SiYuan formula panel, auto-convert to LaTeX.

## Usage

1. Open formula panel (toolbar or `/` menu)
2. Toggle to **Typst** mode (remembers your choice)
3. Type Typst math, e.g. `sum_(i=1)^n i`
4. Confirm — auto-converted to LaTeX, rendered by KaTeX

## Install

Download `package.zip` from [Releases](../../releases) and import in SiYuan.

## How It Works

Uses [tex2typst](https://github.com/qwinsi/tex2typst) to convert Typst math → LaTeX in real-time when SiYuan reads the formula value. No WASM, no CDN, ~59KB.
