const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const mongoDBSession = require("connect-mongodb-session")(session);

// file imports
const { userDataValidation, isEmailRegex } = require("./utils/authUtils");
const userModel = require("./models/userModel");
const { isAuth } = require("./middleware/isAuth");

// constants
const app = express();
const PORT = process.env.PORT || 8000;
const store = new mongoDBSession({
  uri: process.env.MONGO_URI,
  collection: "sessions",
});

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

app.use(
  session({
    secret: process.env.SECRET,
    store: store,
    resave: false,
    saveUninitialized: false,
  })
);

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
      message: "User created successfully!",
      data: userDb,
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

app.post("/login-form", async (req, res) => {
  console.log(req.body);

  const { loginId, password } = req.body;
  if (!loginId || !password)
    return res.json({
      status: 400,
      message: "Please provide all required fields.",
    });

  let userData;

  try {
    if (isEmailRegex({ str: loginId })) {
      userData = await userModel.findOne({ email: loginId });
    } else {
      userData = await userModel.findOne({ username: loginId });
    }
    console.log(userData);
    if (!userData) {
      return res.status(403).json({
        status: 403,
        error: `User not found`,
      });
    }

    const isMatched = await bcrypt.compare(password, userData.password);

    if (!isMatched) {
      return res.status(401).json({
        status: 401,
        error: `Wrong Password!`,
      });
    }

    console.log(req.session);
    req.session.isAuth = true;
    req.session.user = {
      username: userData.username,
      email: userData.email,
      userId: userData._id,
    };

    return res.status(200).json("Login Successful!");
  } catch (error) {
    return res.status(400).json({
      status: 500,
      message: "Server Error",
      error,
    });
  }

  // return res.send({
  //   status: 200,
  //   message: "Login Successfully!",
  // });
});

app.get("/check", isAuth, (req, res) => {
  return res.send("Dashboard Page!");
});

app.listen(PORT, () => {
  console.log("Server is running on 👇");
  console.log(`http://localhost:${PORT}`);
});
