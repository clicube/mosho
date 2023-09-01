module.exports = {
  root: true,
  plugins: ["@typescript-eslint"],
  parser: "@typescript-eslint/parser",
  extends: ["eslint:recommended", "prettier"],
  env: {
    node: true,
  },
  rules: {
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
  },
  ignorePatterns: ["dist/**/*"],
  overrides: [
    {
      files: ["*.ts", "*.tsx"],
      parserOptions: {
        project: "./tsconfig.json",
      },
      extends: [
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
      ],
    },
  ],
};
