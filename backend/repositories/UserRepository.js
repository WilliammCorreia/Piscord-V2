const User = require("../models/User");

class UserRepository {

    async create(userData) {
        const user = new User(userData);
        return await user.save();
    }
}

module.exports = new UserRepository();