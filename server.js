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
const { todoDataValidation } = require("./utils/todoUtils");
const todoModel = require("./models/todoModel");

// constants
const app = express();
const PORT = process.env.PORT || 8000;
const store = new mongoDBSession({
  uri: process.env.MONGO_URI,
  collection: "sessions",
});
const Schema = mongoose.Schema;

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
    await userObj.save();
    return res.redirect("/login");
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

    req.session.isAuth = true;
    req.session.user = {
      username: userData.username,
      email: userData.email,
      userId: userData._id, // BSON error userData._id.toString()
    };

    return res.redirect("/dashboard");
  } catch (error) {
    return res.status(400).json({
      status: 500,
      message: "Server Error",
      error,
    });
  }
});

app.get("/dashboard", isAuth, (req, res) => {
  return res.render("dashboard");
});

app.post("/logout", isAuth, (req, res) => {
  req.session.destroy((err) => {
    if (err) throw err;
    return res.redirect("/login");
  });
});

app.post("/logout_from_all_devices", isAuth, async (req, res) => {
  const username = req.session.user.username;

  const sessionSchema = new Schema({ _id: String }, { strict: false });

  const sessionModel = mongoose.model("sessions", sessionSchema);

  try {
    const deleteData = await sessionModel.deleteMany({
      "session.user.username": username,
    });
    return res.send({
      status: 200,
      message: "Logged out from all devices successfully.",
      data: deleteData,
    });
  } catch (error) {
    return res.redirect("/login");
  }
});

// Todo Api's

// Create a todo
app.post("/create-item", isAuth, async (req, res) => {
  console.log(req.session);
  const todoText = req.body.todo;
  const username = req.session.user.username;
  try {
    await todoDataValidation({ todoText });
  } catch (error) {
    return res.status(401).json("Invalid Input");
  }

  const todoObj = new todoModel({
    todo: todoText,
    username,
  });

  try {
    const todoDb = await todoObj.save();

    // const todoDb = await todoModel.create({ todo: todoText, username });

    return res.status(200).json({
      status: 201,
      message: `Todo created for ${username} successfully!`,
      data: todoDb,
    });
  } catch (error) {
    return res.status(500).json(`Error creating the item.`);
  }
});

// Read all todos of user
app.get("/read-item", isAuth, async (req, res) => {
  const username = req.session.user.username;

  try {
    const todoDb = await todoModel.find({ username });
    console.log(todoDb);
    if (todoDb.length === 0) {
      return res.status(204).json("No Data Found!");
    }

    return res.status(200).json({
      status: 200,
      message: "Successfully fetched Todos.",
      data: todoDb,
    });
  } catch (error) {
    return res.status(500).json(`Server Error`);
  }
});

// Edit a specific todo
app.post("/edit-item", isAuth, async (req, res) => {
  const { todoId, newData } = req.body;
  const username = req.session.user.username;

  if (!todoId) return res.status(400).send("Missing parameter");

  try {
    await todoDataValidation({ todoText: newData });
  } catch (error) {
    return res.status(400).send(error);
  }

  try {
    const todoDb = await todoModel.findOne({ _id: todoId });
    if (!todoDb) {
      return res.status(404).json(`Item not found with id "${todoId}"`);
    }
    // Checking if the logged in user is owner of this task
    if (username !== todoDb.username) {
      return res
        .status(403)
        .json("You are not authorized to perform this action");
    }

    const prevTodo = await todoModel.findOneAndUpdate(
      { _id: blogId },
      { todo: newData }
    );

    return res.send({
      status: 201,
      message: `The item has been updated successfully!`,
      data: prevTodo,
    });
  } catch (error) {
    return res.status(500).json(`Failed to edit the item.`);
  }
});

app.listen(PORT, () => {
  console.log("Server is running on 👇");
  console.log(`http://localhost:${PORT}`);
});
