import bcrypt from 'bcryptjs';

/**
 *  Create A Hash Password
 */

export const hashPassword = (password) => {

    // salt gen
    const salt = bcrypt.genSaltSync(12);
    const hashpass = bcrypt.hashSync(password, salt);
    return hashpass;

}


/**
 *  Password Match
 */

 export const passwordVerify = (password, hash ) => {

    // 
    return bcrypt.compareSync( password, hash );
    
    
}