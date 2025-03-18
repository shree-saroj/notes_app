require("dotenv").config();
const config = require("./config.json");
const mongoose = require("mongoose");

mongoose.connect(config.connectionString);

const User = require("./models/user_models");
const Note = require("./models/note_model");

const express = require("express");
const cors = require("cors");
const app = express();
const jwt = require("jsonwebtoken");
const { authenticate, authenticateToken } = require("./utilities");
app.use(express.json());

app.use(
  cors({
    origin: "*",
  })
);

app.get("/", (req, res) => {
  res.json({ data: "Test" });
});

//Create Account
app.post("/create_account", async (req, res) => {
  const { fullName, email, password } = req.body;
  if (!fullName) {
    return res
      .status(400)
      .json({ error: true, message: "Full Name is Required!" });
  }
  if (!email) {
    return res.status(400).json({ error: true, message: "Email is Required!" });
  }
  if (!password) {
    return res
      .status(400)
      .json({ error: true, message: "Password is Required!" });
  }
  const isUser = await User.findOne({ email: email });
  if (isUser) {
    return res.json({
      error: true,
      message: `User with email: ${email} already exists!`,
    });
  } else {
    const user = new User({
      fullName,
      email,
      password,
    });
    await user.save();
    const accessToken = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "30m",
    });
    return res.status(200).json({
      error: false,
      user,
      accessToken,
      message: "User Registered Successfully!",
    });
  }
});

//Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is Required!" });
  }
  if (!password) {
    return res.status(400).json({ message: "Password is Required!" });
  }
  const userInfo = await User.findOne({ email: email });
  if (!userInfo) {
    return res.status(400).json({ message: "User not found!" });
  }
  if (userInfo.email == email && userInfo.password == password) {
    const user = { user: userInfo };
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "30m",
    });
    return res
      .status(200)
      .json({ error: false, message: "Login Successful!", email, accessToken });
  } else {
    return res
      .status(400)
      .json({ error: true, message: "Invalid Credentials" });
  }
});

//Get User
app.get("/get_user", authenticateToken, async (req, res) => {
  const { user } = req.user;
  const isUser = await User.findOne({ _id: user._id });
  if (!isUser) {
    return res.status(401);
  } else {
    return res.status(200).json({
      error: false,
      user: {
        fullName: isUser.fullName,
        email: isUser.email,
        _id: isUser._id,
        createdOn: isUser.createdOn,
      },
      message: "",
    });
  }
});

//Add Note
app.post("/add_note", authenticateToken, async (req, res) => {
  const { title, content, tags } = req.body;
  const { user } = req.user;

  if (!title) {
    return res
      .status(400)
      .json({ error: true, message: "Note title is Required!" });
  }
  if (!content) {
    return res
      .status(400)
      .json({ error: true, message: "Note content is Required!" });
  }

  try {
    const note = new Note({
      title,
      content,
      tags: tags || [],
      userId: user._id,
    });
    await note.save();
    return res
      .status(200)
      .json({ error: false, note, message: "Note added Successfully!" });
  } catch (err) {
    return res
      .status(500)
      .json({ error: true, message: "Internal Server Error" });
  }
});

//Edit Note
app.put("/edit_note/:noteId", authenticateToken, async (req, res) => {
  const noteId = req.params.noteId;
  const { title, content, tags, isPinned } = req.body;
  const { user } = req.user;

  if (!title && !content && !tags) {
    return res.status(400).json({ error: true, message: "No Changes Found!" });
  } else {
    try {
      const note = await Note.findOne({ _id: noteId, userId: user._id });
      if (!note) {
        return res
          .status(400)
          .json({ error: true, message: "Note not Found!" });
      } else {
        if (title) note.title = title;
        if (content) note.content = content;
        if (tags) note.tags = tags;
        if (isPinned) note.isPinned = isPinned || false;
        await note.save();
        return res.status(200).json({
          error: false,
          note,
          message: "Note Updated Successfully!",
        });
      }
    } catch (err) {
      return res.status(500).json({
        error: true,
        message: "Internal Server Error!",
      });
    }
  }
});

// Fecth all Notes
app.get("/get_all_notes", authenticateToken, async (req, res) => {
  const { user } = req.user;
  try {
    const notes = await Note.find({ userId: user._id }).sort({ isPinned: -1 });
    return res.status(200).json({
      error: false,
      notes,
      message: "All Notes Retrived Successfully!",
    });
  } catch (err) {
    return res
      .status(500)
      .json({ error: true, message: "Internal Server Error" });
  }
});

//Delete a Note
app.delete("/delete_note/:noteId", authenticateToken, async (req, res) => {
  const noteId = req.params.noteId;
  const { user } = req.user;
  try {
    const note = await Note.findOne({ _id: noteId, userId: user._id });
    if (!note) {
      return res.status(400).json({ error: true, message: "Note not Found" });
    } else {
      await note.deleteOne({ _id: noteId, userId: user._id });
      return res
        .status(200)
        .json({ error: false, message: "Note Deleted Successfully!" });
    }
  } catch (err) {
    return res
      .status(500)
      .json({ error: true, message: "Internal Server Error" });
  }
});

//Update Note Pinned Status
app.put("/update_note_pinned/:noteId", authenticateToken, async (req, res) => {
  const noteId = req.params.noteId;
  const { isPinned } = req.body;
  const { user } = req.user;

  try {
    const note = await Note.findOne({ _id: noteId, userId: user._id });
    if (!note) {
      return res.status(400).json({ error: true, message: "Note not Found!" });
    } else {
      note.isPinned = isPinned;
      await note.save();
      return res.status(200).json({
        error: false,
        note,
        message: `${note.isPinned ? "Note Pinned" : "Note Unpinned"}`,
      });
    }
  } catch (err) {
    return res.status(500).json({
      error: true,
      message: "Internal Server Error!",
    });
  }
});

app.listen(8000);
module.exports = app;
