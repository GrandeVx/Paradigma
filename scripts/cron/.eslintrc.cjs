/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ["../../.eslintrc.cjs"],
  ignorePatterns: ["*.cjs"],
  overrides: [
    {
      files: ["src/**/*.ts"],
      parser: "@typescript-eslint/parser",
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: __dirname,
      },
    },
  ],
}; 