const userDataValidation = ({ name, email, username, password }) => {
  return new Promise((resolve, reject) => {
    if (!name || !email || !username || !password)
      reject("All fields are required");

    // Name validation
    if (typeof name !== "string") reject("Name must be a string");
    else if (name.length < 3) reject("Name should have at least 3 characters");
    else if(name.length > 50) reject("Name should not exceed 50 characters");

    // Email validation (emails should  look like foo@bar.com) it can contain numbers but should not contain uppercase
    let emailIsValid = /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/;
    if (!emailIsValid.test(email)) reject("Email is invalid");

    // Username validation
    if (typeof username !== "string" || username.length < 5)
      reject("Username should contain at least  5 characters");
    if(username.indexOf(' ') != -1 ) reject("Username cannot contain spaces");
    if(username.length > 20) reject("Username can't exceed 20 characters");

    // Password validation
    if (
      typeof password !== "string" ||
      password.toString().trim() === ""
    )
      reject("Password field cannot be empty");

    const passwordLength = password.length;
    if (passwordLength < 8)
      reject("Password should have at least  8 characters");
    else if (passwordLength > 16)
      reject("Password should not exceed 16 characters");
    else if(password.search(/[A-Z]/) < 0)
    reject("Password should include at least one uppercase letter");
    else if(password.search(/^(?=.*[a-z])/) == -1)
      reject("Password should include at least one lowercase letter");
    else if(password.search(/[\d]/) < 0)
      reject("Password should include at least one number");
    else if(password.search(/\W/) < 0)
      reject("Password should include at least one special character");
    else if(password.search(/\d/) == -1)
      reject("Password should include at least one digit");

    resolve();
  });
};

module.exports = { userDataValidation };
