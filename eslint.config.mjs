import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  ...nextVitals,
  {
    ignores: [".next/**", "node_modules/**", "src/generated/**", "tsconfig.tsbuildinfo"],
  },
];

export default eslintConfig;
