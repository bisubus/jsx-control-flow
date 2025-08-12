import type { OutputChunk } from 'rollup';
import { minify } from 'terser';
import type { Plugin } from 'vite';

// https://github.com/vitejs/vite/issues/6555#issuecomment-1620817591
export function viteMinifyBundlesPlugin(): Plugin {
  return {
    name: 'minifyBundlesPlugin',
    async generateBundle(_options, bundle) {
      // eslint-disable-next-line prefer-const
      for (let key in bundle) {
        if (bundle[key].type == 'chunk' && key.endsWith('.js')) {
          const chunk = bundle[key] as OutputChunk;
          const minifyCode = await minify(chunk.code, { sourceMap: true });
          chunk.code = minifyCode.code!;
        }
      }
    },
  };
}
