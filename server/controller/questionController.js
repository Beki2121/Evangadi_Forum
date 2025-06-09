// Functionality for Get all Questions
const { StatusCodes } = require("http-status-codes");
const dbConnection = require("../config/dbConfig");
const crypto = require("crypto");
// get all questions -- CORRECTED FUNCTION
async function getAllQuestions(req, res) {
  try {
    const [questions] = await dbConnection.query(`SELECT
            q.questionid,
            q.title,
            q.description,
            q.createdAt,
            u.username
        FROM questions q
        INNER JOIN users u ON q.userid = u.userid
        ORDER BY q.createdAt DESC`); // Removed extra spaces/invisible characters
    return res.status(StatusCodes.OK).json({
      message: questions,
    });
  } catch (err) {
    console.error(err);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Something went wrong, please try again later" });
  }
}
