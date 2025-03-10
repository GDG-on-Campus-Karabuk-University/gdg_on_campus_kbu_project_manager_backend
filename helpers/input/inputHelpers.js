const bcrypt = require("bcrypt");

const validateUserInput = (email, password) => {

    return email && password;
};

const comparePassword = (password, hashedPassword) => {
    return bcrypt.compareSync(password, hashedPassword);
}

module.exports = {
    validateUserInput,
    comparePassword
};