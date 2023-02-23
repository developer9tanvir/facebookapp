import User from "../models/User.js";
import createError from "../Utility/createError.js";
import { getRandom } from "../Utility/math.js";
import { hashPassword, passwordVerify } from "../Utility/sash.js";
import {
  sendActivationLink,
  sendPasswordForgotLink,
} from "../Utility/sendmail.js";
import { createToken, tokenVerify } from "../Utility/token.js";
import { isEmail } from "../Utility/validate.js";

/**
 * @access public
 * @route /api/User/register
 * @method post
 */
export const register = async (req, res, next) => {
  try {
    // get form data
    const {
      first_name,
      sur_name,
      email,
      password,
      birth_date,
      birth_manth,
      birth_year,
      gender,
    } = req.body;
    // validation
    if (!first_name || !sur_name || !email || !password || !gender) {
      next(createError(400, "All fileds are required !"));
    }

    if (!isEmail(email)) {
      next(createError(400, "Invalid email address !"));
    }

    const emailUser = await User.findOne({ email: email });

    if (emailUser) {
      next(createError(400, "Email already axists !"));
    }

    // create access token
    let activationCode = getRandom(1000, 99999);

    // chake activation code
    const chakeCode = await User.findOne({ access_token: activationCode });

    if (chakeCode) {
      activationCode = getRandom(1000, 99999);
    }

    // create user
    const user = await User.create({
      first_name,
      sur_name,
      email,
      password: hashPassword(password),
      birth_date,
      birth_manth,
      birth_year,
      gender,
      access_token: activationCode,
    });

    if (user) {
      // create activation token
      // const token = createToken({ id : user._id }, '365d');
      const activationToken = createToken({ id: user._id }, "30d");

      // create activation mail
      sendActivationLink(user.email, {
        name: user.first_name + " " + user.sur_name,
        link: `${
          process.env.APP_URL + ":" + process.env.PORT
        }/api/v1/user/activate/${activationToken}`,
        code: activationCode,
      });

      // send respons
      res.status(200).json({
        message: "User create successfull",
        user: user,
        // token : token
      });
    }
  } catch (error) {}
};

/**
 * @access public
 * @route /api/User/login
 * @method post
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // validation from
    if (!email || !password) {
      next(createError(400, "All fields are required"));
    }

    if (!isEmail(email)) {
      next(createError(400, "Invalid email address !"));
    }

    const loginUser = await User.findOne({ email: email });

    if (!loginUser) {
      next(createError(400, "Login user not found"));
    } else {
      if (!passwordVerify(password, loginUser.password)) {
        next(createError(400, "Wrong password"));
      } else {
        // create token
        const token = createToken({ id: loginUser._id }, "365d");

        res.status(200).cookie("authToken", token).json({
          messagem: "User Login successfull",
          user: loginUser,
          token: token,
        });
      }
    }
  } catch (error) {}
};

/**
 * @access public
 * @route /api/User/me
 * @method GET
 */
export const loggerInUser = async (req, res, next) => {
  try {
    const auth_token = req.headers.authorization;

    if (!auth_token) {
      next(createError(400, "Token not found"));
    }

    if (auth_token) {
      const token = auth_token.split(" ")[1];
      const user = tokenVerify(token);

      if (!user) {
        next(createError(400, "Invalid token"));
      }

      if (user) {
        const loggerInUser = await User.findById(user.id);

        if (!loggerInUser) {
          next(createError(400, "user data not match"));
        } else {
          res.status(200).json({
            meassage: "user data stable",
            user: loggerInUser,
          });
        }
      }
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Account activation by email
 */

/**
 * @access public
 * @route /api/user/account activate by email
 * @method Get
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
export const activateAccount = async (req, res, next) => {
  try {
    // get token
    const { token } = req.params;

    // check token
    if (!token) {
      next(createError(400, "Invalid activation token"));
    } else {
      // verify token
      const tokenData = tokenVerify(token);

      // check verify token
      if (!tokenData) {
        next(createError(400, "Invalid verify token"));
      }

      // now activate account
      if (tokenData) {
        const account = await User.findById(tokenData.id);

        // check account varify
        if (account.isActivate == true) {
          next(createError(400, "Account already activate"));
        } else {
          await User.findByIdAndUpdate(tokenData.id, {
            isActivate: true,
            access_token: "",
          });

          res.status(200).json({
            message: "Account activate successfull",
          });
        }
      }
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Account activate by code
 */

export const activateAccountByCode = async (req, res, next) => {
  try {
    const { code } = req.body;

    const user = await User.findOne().and([
      { access_token: code },
      { isActivate: false },
    ]);

    if (!user) {
      next(createError(400, "Activation user not found"));
    }

    if (user) {
      await User.findByIdAndUpdate(user._id, {
        isActivate: true,
        access_token: "",
      });

      res.status(200).json({
        message: "User account activation successfull",
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Forgot password
 */

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email });

    if (!user) {
      next(createError(404, "User not found"));
    }

    if (user) {
      // create activation token
      const passwordResetToken = createToken({ id: user._id }, "30m");

      // create access token
      let activationCode = getRandom(1000, 99999);

      // chake activation code
      const chakeCode = await User.findOne({ access_token: activationCode });

      if (chakeCode) {
        activationCode = getRandom(1000, 99999);
      }

      // create activation mail
      sendPasswordForgotLink(user.email, {
        name: user.first_name + " " + user.sur_name,
        link: `${
          process.env.APP_URL + ":" + process.env.PORT
        }/api/v1/user/forgot-password/${passwordResetToken}`,
        code: activationCode,
      });

      await User.findByIdAndUpdate(user._id, {
        access_token: activationCode,
      });

      // send respons
      res.status(200).json({
        messagem: "A password reset link has send to your email",
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @access public
 * @route /api/user/account reset password
 * @method Get
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
export const passwordResetAction = async (req, res, next) => {
  try {
    // get token
    const { token } = req.params;
    const { password } = req.body;

    // check token
    if (!token) {
      next(createError(400, "Invalid password reset url"));
    } else {
      // verify token
      const tokenData = tokenVerify(token);

      // check verify token
      if (!tokenData) {
        next(createError(400, "Invalid token"));
      }

      // now activate account
      if (tokenData) {
        const user = await User.findById(tokenData.id);

        if (!user) {
          next(createError(400, "Invalid User Id"));
        }

        if (user) {
          await User.findByIdAndUpdate(user._id, {
            password: hashPassword(password),
            access_token: "",
          });

          res.status(200).json({
            message: "password changed",
          });
        }
      }
    }
  } catch (error) {
    next(error);
  }
};
