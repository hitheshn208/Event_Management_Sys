const bcrypt = require("bcrypt");

exports.hashPassword = async (str) =>{
    const hash = await bcrypt.hash(str, 5);
    return hash;
}

exports.comparePassword = async (pass, hash) =>{
    const isMatch = await bcrypt.compare(pass, hash);
    return isMatch;
}
