<div align="center">
  <img src="https://raw.githubusercontent.com/pacy-dev/create-pacy/main/assets/pacy-logo.svg" alt="Pacy Logo">
</div>

# create-pacy

This package is used to bootstrap new Vite projects that use **Pacy Devtools**.
It was adapted from the [`create-vite`](https://www.npmjs.com/package/create-vite) package.
The usage is explained in https://pacy.dev/docs/usage#creating-a-new-project .
Currently supported template presets include:

- `vue`
- `vue-ts`
- `react`
- `react-ts`
- `react-swc`
- `react-swc-ts`
- `preact`
- `preact-ts`
- `svelte`
- `svelte-ts`
- `solid`
- `solid-ts`
- `qwik`
- `qwik-ts`

## Scaffolding your project

With NPM:

```bash
npm create pacy@latest
```

With Yarn:

```bash
yarn create pacy
```

With PNPM:

```bash
pnpm create pacy
```

With Bun:

```bash
bun create pacy
```


You can also directly specify the project name and the template you want to use via additional command line options. For example, to scaffold a Vite + Vue project, run:

```bash
# npm 7+, extra double-dash is needed:
npm create pacy@latest my-vue-app -- --template vue

# yarn
yarn create pacy my-vue-app --template vue

# pnpm
pnpm create pacy my-vue-app --template vue

# Bun
bun create pacy my-vue-app --template vue
```