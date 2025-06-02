/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ["../../.eslintrc.cjs"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json",
    tsconfigRootDir: __dirname,
  },
  ignorePatterns: [".eslintrc.js"],
}; 