const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
const User = require("./models/User.js");
const Post = require("./models/Post.js");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const app = express();
const jwt = require("jsonwebtoken");
const multer = require("multer"); //a library which takes care of the uploaded parts
const uploadMiddleware = multer({ dest: "uploads/" });
const fs = require("fs"); //filesystem

const salt = bcrypt.genSaltSync(10);

app.use(express.json());
app.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000",
  })
);
app.use(cookieParser());
app.use("/uploads", express.static(__dirname + "/uploads"));

mongoose.connect(process.env.MONGO_URL);

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const userDoc = await User.findOne({ email }); //grabbing the user data from the database

  const passOk = bcrypt.compareSync(password, userDoc.password);

  if (passOk) {
    jwt.sign(
      { email: userDoc.email, id: userDoc._id, name: userDoc.name },
      process.env.JWT_SECRET,
      {},
      (err, token) => {
        if (err) throw err;
        res.cookie("token", token).json(userDoc);
      }
    );
  } else {
    res.status(400).json("Wrong Credentials,Plzz check");
  }
});

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userDoc = await User.create({
      name,
      email,
      password: bcrypt.hashSync(password, salt),
    });
    res.json(userDoc);
  } catch (e) {
    console.log(e);
    res.status(400).json(e);
  }
});

//api just to check profile whether we r logged in or not --it will just return the profile

app.get("/profile", (req, res) => {
  const { token } = req.cookies;
  jwt.verify(token, process.env.JWT_SECRET, {}, (err, info) => {
    if (err) throw err;
    res.json(info);
  });
});

app.post("/logout", async (req, res) => {
  res.cookie("token", "").json("ok");
});

// api for the app post request as this post api is posting every content to the database

app.post("/post", uploadMiddleware.single("file"), async (req, res) => {
  const { originalname, path } = req.file;
  const parts = originalname.split("."); //splitting the extension part
  const ext = parts[parts.length - 1];
  const newPath = path + "." + ext;
  fs.renameSync(path, newPath);

  //to save all these things in the database we would require a model so after making a model we r grabbing it
  //we also have to grab the jwt cookie for the author name which we would gram from its id

  const { token } = req.cookies;
  jwt.verify(token, process.env.JWT_SECRET, {}, async (err, info) => {
    //from here we get the information
    if (err) throw err;

    const { title, summary, content } = req.body;
    const postDoc = await Post.create({
      title,
      summary,
      content,
      cover: newPath,
      author: info.id,
    });

    res.json(postDoc);
  });
});

//api for the edit and update

app.put("/post", uploadMiddleware.single("file"), async (req, res) => {
  let newPath = null;
  if (req.file) {
    const { originalname, path } = req.file;
    const parts = originalname.split(".");
    const ext = parts[parts.length - 1];
    newPath = path + "." + ext;
    fs.renameSync(path, newPath);
  }

  const { token } = req.cookies;
  jwt.verify(token, process.env.JWT_SECRET, {}, async (err, info) => {
    if (err) throw err;
    const { id, title, summary, content } = req.body;
    const postDoc = await Post.findById(id);
    const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
    if (!isAuthor) {
      return res.status(400).json("you are not the author");
    }
    await postDoc.updateOne({
      title,
      summary,
      content,
      cover: newPath ? newPath : postDoc.cover,
    });

    res.json(postDoc);
  });
});

//api for the same all the content we need to put a get request
app.get("/post", async (req, res) => {
  res.json(
    await Post.find()
      .populate("author", ["name"])
      .sort({ createdAt: -1 })
      .limit(20)
  );
});

// api for the inner post page content with the id of that particular photo
app.get("/post/:id", async (req, res) => {
  const { id } = req.params;
  const postDoc = await Post.findById(id).populate("author", ["name"]);
  res.json(postDoc);
});

app.listen(4000, () => {
  console.log(`Server is running on http://localhost:4000`);
});
