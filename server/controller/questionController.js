// Functionality for Get all Questions
async function getAllQuestions(req,res){
  try {
    const [questions] = await dbConnection.query(
      "select a.questionid as question_id,a.title,a.description,a.userid as user_id,a.created_at, u.username from questions a join users u on a.userid=u.userid"
     
    );
    if (questions.length == 0) {
      res.status(StatusCodes.NOT_FOUND).json({
        error: "Not Found",
        message: "No questions found.",
      });
    }
   
    res.status(StatusCodes.OK).json({ questions });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "Internal Server Error",
      message: "An unexpected error occurred.",
    });
  }
}
// Functionality for Get all Questions