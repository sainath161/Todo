const todoDataValidation = ({ todoText }) => {
  return new Promise((resolve, reject) => {
    if (!todoText) reject("Please enter a valid Todo text");

    if (typeof todoText !== "string") reject("Todo is not a Text");

    if (todoText.length < 3 || todoText.length > 100)
      reject("The length of the Todo should be between 3 and 100 characters");

    resolve();
  });
};

module.exports = { todoDataValidation };
