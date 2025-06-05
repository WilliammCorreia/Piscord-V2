const UserRepository = require("../repositories/UserRepository");
const bcrypt = require("bcrypt");

class AuthService {

    async signup(signupData) {
        const { email, password, username } = signupData;

        const hash = await bcrypt.hash(password, 12);
        console.log(hash);

        // UserRepository.create({ email, password, username });
        const test = {email, password, username};
        return test;
    }
}

module.exports = new AuthService();