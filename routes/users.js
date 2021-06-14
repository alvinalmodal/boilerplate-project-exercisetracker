const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Exercise = require("../models/exercise");

const getCurrentDateTime = () => {
  let date = new Date();
  let year = new Intl.DateTimeFormat("en", { year: "numeric" }).format(date);
  let month = new Intl.DateTimeFormat("en", { month: "2-digit" }).format(date);
  let day = new Intl.DateTimeFormat("en", { day: "2-digit" }).format(date);
  return `${year}-${month}-${day}`;
};

const formatDate = (date) => {
  let year = new Intl.DateTimeFormat("en", { year: "numeric" }).format(date);
  let month = new Intl.DateTimeFormat("en", { month: "short" }).format(date);
  let shortDay = new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(
    date
  );
  let day = new Intl.DateTimeFormat("en", { day: "2-digit" }).format(date);
  return `${shortDay} ${month} ${day} ${year}`;
};

router.get("/", async (req, res) => {
  let users = await User.find();
  res.send(users);
});

router.post("/", async (req, res) => {
  try {
    const { username: newUsername } = req.body;

    let currentUser = await User.findOne({ username: newUsername });

    if (currentUser) {
      res.send("Username already taken");
      return;
    }

    if (
      newUsername &&
      typeof newUsername === "string" &&
      newUsername.length > 0
    ) {
      let { username, _id } = await User.create({ username: newUsername });
      res.send({ username, _id });
    } else {
      res.status(400);
      res.send({ error: "Username is required" });
    }
  } catch (error) {
    res.send(error.message);
  }
});

router.post("/:_id/exercises", async (req, res) => {
  try {
    const { _id } = req.params;

    let user = await User.findOne({ _id });

    if (!user) {
      res.send("not found.");
      return;
    }

    let { description, duration, date } = req.body;
    date = date || getCurrentDateTime();

    let {
      description: newDescription,
      duration: newDuration,
      date: newDate,
      user: newUser,
    } = await Exercise.create({
      user: { username: user.username, _id: user._id },
      description,
      duration,
      date,
    });
    res.send({
      _id: newUser._id,
      username: newUser.username,
      date: formatDate(newDate),
      duration,
      description,
    });
  } catch (error) {
    res.send(error.message);
  }
});

router.get("/:_id/logs", async (req, res) => {
  try {
    let { _id } = req.params;
    let { from, to, limit } = req.query;
    limit = parseInt(limit) || 0;
    let user = await User.findOne({ _id });

    if (!user) {
      res.send("Unknown userId");
      return;
    }

    let exercises = [];
    if (from && to) {
      exercises = await Exercise.find({
        "user._id": user._id,
        date: {
          $gte: new Date(from),
          $lte: new Date(to),
        },
      }).limit(limit);
    } else {
      exercises = await Exercise.find({
        "user._id": user._id,
      }).limit(limit);
    }

    res.send({
      _id: user._id,
      username: user.username,
      count: exercises.length,
      log: exercises,
    });
  } catch (error) {
    res.send(error.message);
  }
});

module.exports = router;
