import * as path from 'node:path';
import * as url from 'node:url';

import vitePluginReact from '@vitejs/plugin-react';
import type { ModuleFormat } from 'rollup';
import type { LibraryFormats, LibraryOptions } from 'vite';
import vitePluginDts from 'vite-plugin-dts';
import vitePluginNoBundle from 'vite-plugin-no-bundle';
import { defineConfig, type UserConfig } from 'vitest/config';

import packageJson from './package.json';
import { getCliParams } from './scripts/vite/cli-params';
import { viteMinifyBundlesPlugin } from './scripts/vite/plugin-minify-bundles';
import { toKebabCase, toPascalCase } from './scripts/vite/utils';

type TCliParams = 'minify' | 'unbundled';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const cliParams = getCliParams<TCliParams>(process.argv, true);
const packageFilename = toKebabCase(packageJson.name);
const packageNamespace = toPascalCase(packageJson.name);
const bundleFormats: LibraryFormats[] = ['es', 'umd'];

export default defineConfig((configEnv): UserConfig => {
  const isBuildMode = configEnv.command === 'build';
  const isUnbundled = isBuildMode && cliParams.has('unbundled');
  const isMinify = isBuildMode && !isUnbundled && cliParams.has('minify');
  const isDts = isBuildMode;
  const isDebugConfig = false;

  const baseConfig = {
    base: './',
    build: {
      target: 'es2015',
      outDir: './dist',
      emptyOutDir: false,
      cssCodeSplit: false,
      minify: isMinify ? 'terser' : false,
      terserOptions: {},
      sourcemap: true,
      lib: {
        entry: path.resolve(__dirname, 'src/index.ts'),
        name: packageNamespace,
        formats: bundleFormats,
        fileName: ((format: LibraryFormats) => {
          return `${packageFilename}.${format}${isMinify ? '.min' : ''}.js`;
        }) as (format: ModuleFormat) => string,
      },
      rollupOptions: {
        external: ['react', 'react-dom'],
        output: {
          globals: {
            react: 'React',
            'react-dom': 'ReactDOM',
          },
        },
      },
    },
    resolve: {
      alias: [{ find: '@', replacement: path.resolve(__dirname, 'src') }],
    },
    plugins: [
      vitePluginReact(),
      isUnbundled && vitePluginNoBundle({ copy: '**/*.css' }),
      isDts &&
        vitePluginDts({
          // https://github.com/qmhc/vite-plugin-dts#options
          // Workaround for composite tsconfig with "references"
          tsconfigPath: path.resolve(__dirname, 'tsconfig.app.json'),
          // Allow side effect imports
          clearPureImport: false,
          // See https://api-extractor.com/pages/configs/api-extractor_json/#bundledpackages
          bundledPackages: [],
          // Output to package.json "types" location
          rollupTypes: !isUnbundled,
        }),
      isMinify && viteMinifyBundlesPlugin(),
    ],
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./vitest.setup.ts'],
      include: ['src/**/__test__/**/*.ts?(x)', 'src/**/*.{test.ts?(x),test-d.ts}'],
    },
  } satisfies UserConfig;

  let mergedConfig: UserConfig = baseConfig;

  // Unbundled ESM
  if (isUnbundled) {
    const unbundledConfig = {
      build: {
        outDir: './dist/es',
        lib: {
          formats: ['es'],
          fileName: undefined,
        } as LibraryOptions,
      },
      plugins: [],
    } satisfies UserConfig;

    // Custom merging logic that differs from mergeConfig
    mergedConfig = {
      ...baseConfig,
      build: {
        ...baseConfig.build,
        ...unbundledConfig.build,
        lib: {
          ...baseConfig.build.lib,
          ...unbundledConfig.build.lib,
        },
      },
      plugins: [...baseConfig.plugins, ...unbundledConfig.plugins],
    };
  }

  if (isDebugConfig) {
    console.dir(mergedConfig, { depth: 4 });
  }

  return mergedConfig;
});
