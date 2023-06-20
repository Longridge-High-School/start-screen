module.exports = {
  extends: [
    '@remix-run/eslint-config',
    '@remix-run/eslint-config/node',
    'prettier'
  ],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: './tsconfig.json'
  },
  rules: {
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-throw-literal': 'off'
  }
}
