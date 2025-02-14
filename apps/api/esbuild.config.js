module.exports = {
  platform: 'node',
  format: ['cjs'],
  bundle: false,
  sourcemap: true,
  outExtension: {
    '.js': '.js',
  },
  loader: {
    '.md': 'file',
  },
}
