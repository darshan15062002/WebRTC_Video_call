const jwt = require('jsonwebtoken');
const User = require('../model/userModel');

exports.isAuthenticated = async (req, res, next) => {
    try {
        const { token } = req.cookies;



        // if (!token) return next(new ErrorHander("Not logged in", 401))

        const decodedData = jwt.verify(token, process.env.JWT_SECRET)

        req.user = await User.findById(decodedData._id);
        next()
    } catch (error) {
        console.log("error isAuthenticated", error);

    }
}

