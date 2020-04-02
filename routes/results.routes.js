const { Router } = require("express");
const auth = require("../middleware/auth.middleware");
const router = Router();
const Team = require("../models/Team");
const Result = require("../models/Result");

const getUserTeams = async userId => {
  const teams = await Team.find({ owner: userId });
  return teams.map(team => team._id);
};

const getResults = async teamId => {
  return await Result.find({ teamId });
};

const combineResults = async data => {
  let results = [];
  for (item of data) {
    const result = await getResults(item);
    for (res of result) {
      results.push({
        resultId: res._id,
        teamName: res.teamName,
        theme: res.theme,
        average: res.average,
        date: res.date,
        results: res.results.users
      });
    }
  }
  return results;
};

// /api/results/create
router.get("/", auth, async (req, res) => {
  try {
    const userId = req.userId;
    const data = await getUserTeams(userId);
    const results = await combineResults(data);

    res.status(200).json({ data: results });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error!" });
  }
});

// /api/results/:id
router.get("/:id", auth, async (req, res) => {
  try {
    const resultId = req.params.id;

    const result = await Result.findById(resultId);

    res.status(200).json({ data: result });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error!" });
  }
});

module.exports = router;
