/**
 * @type {import('@remix-run/dev').AppConfig}
 */
export default {
  ignoredRouteFiles: ['.*'],
  //server: 'server/index.js',
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
    /@uiw\/react-textarea-code-editor.*/
  ],
  //serverModuleFormat: 'cjs',
  future: {}
}
