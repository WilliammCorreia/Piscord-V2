class ServerController {

    async getUserServers(req, res) {
        try {
            const userInfo = req.cookies;
            console.log("userInfo : ", userInfo);
            res.send(userInfo);
        }
        catch (err) {
            res.send(userInfo);
        }
    };
}

module.exports = new ServerController();