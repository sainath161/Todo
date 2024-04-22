const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// file imports
const { userDataValidation } = require("./utils/authUtils");
const userModel = require("./models/userModel");

// constants
const app = express();
const PORT = process.env.PORT || 8000;

// DB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error(`DB Connection Error ${err}`);
  });

// middlewares
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res) => {
  return res.render("server");
});

app.get("/register", (req, res) => {
  return res.render("registerPage");
});

app.post("/register-form", async (req, res) => {
  // Validation
  const { name, email, username, password } = req.body;

  try {
    await userDataValidation({ name, email, username, password });
  } catch (error) {
    return res.send({
      status: 400,
      error,
    });
  }

  try {
    // Check if email is already registered
    const isEmailExist = await userModel.findOne({ email });
    if (isEmailExist) {
      return res.status(409).json("Email Already Exist.");
    }

    // Check if username is already taken
    const isUsernameExist = await userModel.findOne({ username });
    if (isUsernameExist) {
      return res.status(409).json("Username Already Exist.");
    }

    // Hashing the password
    const hashedPassword = await bcrypt.hash(
      password,
      Number(process.env.SALT)
    );

    const userObj = new userModel({
      name,
      email,
      username,
      password: hashedPassword,
    });

    // Save the data to database
    const userDb = await userObj.save();
    return res.send({
      status: 201,
      data: userDb,
      message: "User created successfully!",
    });
  } catch (error) {
    return res.send({
      status: 500,
      error: "Internal server error.",
    });
  }
});

app.get("/login", (req, res) => {
  return res.render("loginPage");
});

app.listen(PORT, () => {
  console.log("Server is running on 👇");
  console.log(`http://localhost:${PORT}`);
});
