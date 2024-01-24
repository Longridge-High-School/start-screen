/**
 * @type {import('@remix-run/dev').AppConfig}
 */
module.exports = {
  ignoredRouteFiles: ['.*'],
  //server: './server.js', // Disable by comment in dev if you don't need NTLM
  //server: process.env.NODE_ENV === 'production' ? './server.js' : undefined,
  devServerBroadcastDelay: 1000,
  allowOverwrite: true,
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // serverBuildPath: "build/index.js",
  // publicPath: "/build/",
  // devServerPort: 8002
  tailwind: true,
  browserNodeBuiltinsPolyfill: {
    modules: {
      path: true,
      fs: true,
      url: true,
      querystring: true,
      tls: true,
      net: true,
      events: true,
      stream: true,
      assert: true,
      util: true
    }
  },
  serverDependenciesToBundle: [
    /@arcath\/utils.*/,
    /mdx-bundler.*/,
    /@uiw\/react-textarea-code-editor.*/,
    /rehype.*/,
    'unified',
    /unist.*/,
    /hast-util.*/,
    /refractor.*/,
    'bail',
    'is-plain-obj',
    'trough',
    /vfile.*/,
    'property-information',
    'html-void-elements',
    'zwitch',
    'hastscript',
    'web-namespaces',
    'stringify-entities',
    'ccount',
    'comma-separated-tokens',
    'space-separated-tokens',
    /character-entities.*/,
    'parse-entities',
    'is-decimal',
    'is-hexadecimal',
    'is-alphanumerical',
    'is-alphabetical',
    'character-reference-invalid',
    'decode-named-character-reference',
    'devlop'
  ],
  serverModuleFormat: 'cjs',
  future: {}
}
