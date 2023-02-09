const Users = require("../models/users");

// get info about all the users
const getUsers = async (req, res) => {
  try {
    const users = await Users.find({});
    res.json(users);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// get info about one user with its ID
const getUser = async (req, res) => {
  const { nickname } = req.params;
  try {
    const user = await Users.findOne({ nickname: nickname });
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.json(user);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// create a new user
// it also creates default values at 0 for the statistic
const createUser = async (req, res) => {
  const { nickname } = req.body;
  if (!nickname) {
    return res.status(400).send("Nickname is required");
  }
  try {
    const existingUser = await Users.findOne({ nickname });
    if (existingUser) {
      return res
        .status(409)
        .send("There is already an user with the same nickname");
    }
    const user = new Users({
      nickname,
      games_played: 0,
      games_won: 0,
      games_lost: 0,
    });
    const createdUser = await user.save();
    res.status(201).json(createdUser);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// update info about two users who played a game
// it will take 2 outcomes and depending on them it
// updates the stats in the database
const updateUsers = async (req, res) => {
  const { player, outcome } = req.body;

  try {
    const user = await Users.findOne({ nickname: player });

    if (!user) {
      return res.status(404).send("User not found");
    }

    if (outcome === "You win!") {
      user.games_won += 1;
      user.games_played += 1;
    } else if (outcome === "You lose!") {
      user.games_lost += 1;
      user.games_played += 1;
    }

    const updatedUser = await user.save();

    console.log(updatedUser);
    res.status(200).json({ updatedUser });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUsers,
};
