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
  const { id } = req.params;
  try {
    const user = await Users.findOne({ _id: id });
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
        .status(400)
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
  const { player1, player2, outcome1, outcome2 } = req.body;

  try {
    const user1 = await Users.findOne({ nickname: player1 });
    const user2 = await Users.findOne({ nickname: player2 });

    if (!user1 || !user2) {
      return res.status(404).send("User not found");
    }

    user1.games_played += 1;
    user2.games_played += 1;

    if (outcome1 === "win") {
      user1.games_won += 1;
    } else if (outcome1 === "loss") {
      user1.games_lost += 1;
    }

    if (outcome2 === "win") {
      user2.games_won += 1;
    } else if (outcome2 === "loss") {
      user2.games_lost += 1;
    }

    const updatedUser1 = await user1.save();
    const updatedUser2 = await user2.save();

    res.status(200).json({ updatedUser1, updatedUser2 });
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
