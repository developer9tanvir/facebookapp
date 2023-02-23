/**
 * Email validate
 */
export const isEmail = (email) => {
  let validEmail = email
    .toLowerCase()
    .match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/);

  if (validEmail) {
    return true;
  } else {
    return false;
  }
};
export const validateNumber = (cell) => {
  let validNum = cell.match(/^(01|8801|\+8801)[0-9]{9}$/);

  if (validNum) {
    return true;
  } else {
    return false;
  }
};
