// Made so Mocha will detect ts files.
const register = require("@babel/register").default;

register({ extensions: [".ts", ".tsx", ".js", ".jsx", ".cjs", ".mjs"] });
