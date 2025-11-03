module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "google",
    "plugin:@typescript-eslint/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["tsconfig.json", "tsconfig.dev.json"],
    sourceType: "module",
  },
  ignorePatterns: [
    "/lib/**/*",
  ],
  plugins: [
    "@typescript-eslint",
    "import",
  ],
  rules: {
    "quotes": ["error", "single"],
    "import/no-unresolved": 0,
    "indent": ["error", 2],
    "max-len": ["error", {"code": 120}],
  },
};
```

---

## 📄 File 6: `functions/.gitignore`
**Location:** `~/busy-preacher-mvp/functions/.gitignore`
```
# Compiled JavaScript files
lib/

# TypeScript cache
*.tsbuildinfo

# Node.js dependency directories
node_modules/

# Firebase cache
.firebase/

# Firebase debug log
firebase-debug*.log

# IDE
.idea/
*.iml
*.ipr
*.iws
.vscode/