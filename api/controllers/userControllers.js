
import User from "../models/User.js";
import createError from '../Utility/createError.js';
import { getRandom } from "../Utility/math.js";
import { hashPassword, passwordVerify } from "../Utility/sash.js";
import { sendActivationLink } from "../Utility/sendmail.js";
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
        const { first_name, sur_name, email, password, birth_date, birth_manth, birth_year, gender } = req.body;

        // validation
        if( !first_name || !sur_name || !email || !password || !gender ){
            next(createError(400, "All fileds are required !"));

        }

        if( !isEmail(email) ){
            next(createError(400, "Invalid email address !"));

        }

        const emailUser = await User.findOne({ email : email});

        if( emailUser ){
            next(createError(400, "Email already axists !"));
        }

        // create access token
        const activationCode = getRandom(1000, 99999);

        const user = await User.create({
            first_name,
            sur_name,
            email, password : hashPassword(password),
            birth_date,
            birth_manth,
            birth_year,
            gender,
            access_token : activationCode
        });

        if(user){

            // create activation token
            // const token = createToken({ id : user._id }, '365d');
            const activationToken = createToken({ id : user._id }, '30d');


            // create activation mail
            sendActivationLink(user.email, {
                name : user.first_name +' '+ user.sur_name,
                link : `${process.env.APP_URL +':'+ process.env.PORT }/api/v1/user/activate/:${activationToken}`,
                code : activationCode
            });

            // send respons
            res.status(200).json({
                messagem : "User create successfull",
                user : user,
                // token : token
            });
        }

        
    } catch (error) {
        
    }

    

}

/**
 * @access public
 * @route /api/User/login
 * @method post
 */
 export const login = async (req, res, next) => {

    try {

        const { email, password } = req.body;

        // validation from
        if( !email || !password ){
            next(createError(400, "All fields are required"));
        }

        if( !isEmail(email) ){
            next(createError(400, "Invalid email address !"));
        }

        const loginUser = await User.findOne({ email : email});
        
        if( !loginUser ){
            next(createError(400, "Login user not found"));
        } else {

            if( !passwordVerify( password, loginUser.password )){
                next(createError(400, "Wrong password"));

            } else {

                // create token
                const token = createToken({ id : loginUser._id }, '365d');



                res.status(200).cookie('authToken', token ).json({
                    messagem : "User Login successfull",
                    user : loginUser,
                    token : token
                });

            }




        }


        
    } catch (error) {
        
    }

    

}

/**
 * @access public
 * @route /api/User/me
 * @method GET
 */
 export const loggerInUser = async (req, res, next) => {

    res.send('loggerInUser Okey');

    

}

/**
 * Account activation by email
 */

export const activateAccount = async (req, res, next) => {

    try {


        //get token
        const { token } = req.params;

        //check token
        if( !token ) {
            next(createError(400, 'invalid, activation url'));
        } else {

            // verify token
            const tokenData = tokenVerify(token);

            //check token
            if( !tokenData ) {
                next(createError(400, 'invalid token'));
            }

            // now activate account
            if( tokenData ) {
                await User.findByIdAndUpdate( tokenData.id, {
                    isActivate : true
                });
            }

            res.status(200).json({
                message : "Account activation successfull "
            });

        }

        

        
    } catch (error) {
        
    }

}



