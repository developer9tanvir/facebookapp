

/**
 * Email validate
 */
export const isEmail = (email) => {

    return email.toLowerCase().match(/^[^\.-/][a-z09-_\.]{1,}@[a-z0-9-]{1,}\.[a-z\.]{2,}$/);

} 