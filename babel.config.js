module.exports = {
  plugins: ['@babel/plugin-syntax-jsx', '@babel/plugin-transform-react-jsx', '@babel/plugin-transform-runtime', [
    '@babel/plugin-proposal-class-properties', {
      loose: true
    }]
  ],
  ignore: ['**/*.test.js'],
  comments: false,
  presets: ['minify', ['@babel/env', {
    targets: {
      ie: '11',
      edge: '17',
      firefox: '68',
      chrome: '76',
      safari: '11.1',
    },
    useBuiltIns: 'usage'
  }]]
}
