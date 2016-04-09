module.exports = {
    "extends": "standard",
    "plugins": [
        "standard"
    ],
    "rules": {
        "comma-dangle": ["error", "always-multiline"],
        "operator-linebreak": ["error", "before"],
        "semi": ["error", "always", { "omitLastInOneLineBlock": true}],
    }
};
