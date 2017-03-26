/* eslint-env node */
module.exports = {
  "env": {
    "node": true
  },
  "extends": "standard",
  "plugins": [
    "standard"
  ],
  "rules": {
    "comma-dangle": ["error", "always-multiline"],
    "no-template-curly-in-string": ["off"],
    "operator-linebreak": ["error", "before"],
    "semi": ["error", "always", { "omitLastInOneLineBlock": true}],
  }
};
