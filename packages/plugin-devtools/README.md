# @pacy-dev/plugin-devtools

Pacy DevTools works out of the box with vite-react, vite-vue-3, and vite-svelte boilerplates, Remix, and Next.js v14 (without Turbo). For supporting other bundlers and frameworks, this plugin can be used. 

First of all, this plugin uses [**code-inspector**](https://github.com/zh-lx/code-inspector) internally. It supports bundlers such as <b>Webpack, Vite, Rspack / Rsbuild, Esbuild, Next.js and Nuxt</b>, and it can be used to support <b>Vue 2, Next.js v15 (without Turbo)</b>, and frameworks such as <b>Preact, Solid, Astro, and Qwik</b>. 

It can also be used to troubleshoot problems with some <b>vite-react, vite-vue-3, and vite-svelte</b>  configurations that might have broken sourcemaps. This plugin adds DOM sourcemaps to elements, and Pacy DevTools will use them over any other sourcemap whenever they're available.


## Usage

This section is mostly taken from [**code-inspector**](https://github.com/zh-lx/code-inspector)'s documentation. You can check their configuration instructions [here](https://inspector.fe-dev.cn/en/guide/start.html#configuration).

  <details>
    <summary><b>webpack</b></summary>

  ```js
  // webpack.config.js
  import pacyDevtools from '@pacy-dev/plugin-devtools';

  module.exports = () => ({
    plugins: [
      pacyDevtools({
        bundler: 'webpack',
      }),
    ],
  });
  ```

  </details>

  <details>
    <summary><b>vite</b></summary>

  ```js
  // vite.config.js
  import { defineConfig } from 'vite';
  import { pacyDevtools } from '@pacy-dev/plugin-devtools';

  export default defineConfig({
    plugins: [
      pacyDevtools({
        bundler: 'vite',
      }),
    ],
  });
  ```

  </details>

  <details>
    <summary><b>rspack</b></summary>

  ```js
  // rspack.config.js
  import pacyDevtools from '@pacy-dev/plugin-devtools';

  module.exports = {
    // other config...
    plugins: [
      pacyDevtools({
        bundler: 'rspack',
      }),
      // other plugins...
    ],
  };
  ```

  </details>

  <details>
    <summary><b>rsbuild</b></summary>

  ```js
  // rsbuild.config.js
  import pacyDevtools from '@pacy-dev/plugin-devtools';

  module.exports = {
    // other config...
    tools: {
      rspack: {
        plugins: [
          pacyDevtools({
            bundler: 'rspack',
          }),
        ],
      },
    },
  };
  ```

  </details>

  <details>
    <summary><b>esbuild</b></summary>

  ```js
  // esbuild.config.js
  const esbuild = require('esbuild');
  import pacyDevtools from '@pacy-dev/plugin-devtools';

  esbuild.build({
    // other configs...
    plugins: [pacyDevtools({ bundler: 'esbuild', dev: () => true })],
  });
  ```

  </details>

  <details>
    <summary><b>vue-cli</b></summary>

  ```js
  // vue.config.js
  import pacyDevtools from '@pacy-dev/plugin-devtools';

  module.exports = {
    // ...other code
    chainWebpack: (config) => {
      config.plugin('@pacy-dev/plugin-devtools').use(
        pacyDevtools({
          bundler: 'webpack',
        })
      );
    },
  };
  ```

  </details>

  <details>
    <summary><b>nuxt</b></summary>

  For nuxt3.x :

  ```js
  // nuxt.config.js
  import { pacyDevtools } from '@pacy-dev/plugin-devtools';

  // https://nuxt.com/docs/api/configuration/nuxt-config
  export default defineNuxtConfig({
    vite: {
      plugins: [pacyDevtools({ bundler: 'vite' })],
    },
  });
  ```

  For nuxt2.x :

  ```js
  // nuxt.config.js
  import { pacyDevtools } from '@pacy-dev/plugin-devtools';

  export default {
    build: {
      extend(config) {
        config.plugins.push(pacyDevtools({ bundler: 'webpack' }));
        return config;
      },
    },
  };
  ```

  </details>

  <details>
    <summary><b>next.js</b></summary>

  Next.js ≤ 14.x
  ```js
  // next.config.js
  const pacyDevtools = require('@pacy-dev/plugin-devtools');

  const nextConfig = {
    webpack: (config, { dev, isServer }) => {
      config.plugins.push(pacyDevtools({ bundler: 'webpack' }));
      return config;
    },
  };

  module.exports = nextConfig;
  ```

  Next.js 15.0.x ~ 15.2.x
  ```js
  // next.config.js
  import type { NextConfig } from 'next';
  const pacyDevtools = require('@pacy-dev/plugin-devtools');

  const nextConfig: NextConfig = {
    experimental: {
      turbo: {
        rules: pacyDevtools({
          bundler: 'turbopack',
        }),
      },
    },
  };

  export default nextConfig;
  ```

  Next.js ≥ 15.3.x
  ```js
  // next.config.js
  import type { NextConfig } from 'next';
  const pacyDevtools = require('@pacy-dev/plugin-devtools');

  const nextConfig: NextConfig = {
    turbopack: {
      rules: pacyDevtools({
        bundler: 'turbopack',
      }),
    },
  };

  export default nextConfig;
  ```

  In some Next.js versions, Turbopack can be on or off via the `--turbopack` flag in **package.json** (e.g. `"dev": "next dev --turbopack"`).
  Before setting the bundler option to `turbopack` or `webpack`, be sure to check the dev command in **package.json**.
</details>

<details>
  <summary><b>astro</b></summary>

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import { pacyDevtools } from '@pacy-dev/plugin-devtools';

export default defineConfig({
  vite: {
    plugins: [pacyDevtools({ bundler: 'vite' })],
  },
});
```

</details>

## Acknowledgement

This plugin relies on [code-inspector](https://github.com/zh-lx/code-inspector) internally, with following settings: 

```
hideDomPathAttr: true,
hotKeys: false,
hideConsole: true,
pathType: 'absolute'
``` 
