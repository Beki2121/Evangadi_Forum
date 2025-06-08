// Description: This module sets up a MySQL database connection using the mysql2 library and environment variables for configuration.
const dbConnection = require("../config/dbConfig");
const bcrypt = require("bcrypt");
const { use } = require("bcrypt/promises");
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

async function register(req, res) {
  const { username, firstname, lastname, email, password } = req.body;

  const currentTimestamp = new Date();
  currentTimestamp.setHours(currentTimestamp.getHours() + 3); // Adjusting for UTC+3
  const formattedTimestamp = currentTimestamp
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");

  // Check if all required fields are provided
  if (!username || !firstname || !lastname || !email || !password) {
    return res
      .status(StatusCodes.BAD_REQUEST) // Using StatusCodes
      .json({ Msg: "Please provide all required fields." });
  }

  // Check if password is at least 8 characters long
  if (password.length < 8) {
    return res
      .status(StatusCodes.BAD_REQUEST) // Using StatusCodes
      .json({ Msg: "Password should be at least 8 characters long." });
  }
  // Strong password regex
  const strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

  if (!strongPasswordRegex.test(password)) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      Msg: "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.",
    });
  }
  try {
    // Check if the username or email already exists
    const [user] = await dbConnection.query(
      "SELECT username, userid FROM users WHERE username = ? OR email = ?",
      [username, email]
    );

    if (user.length > 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        Msg: "Username or Email already exists. Please try with a different username or email.",
      });
    }

    // Encrypting the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert new user into the database
    await dbConnection.query(
      "INSERT INTO users (username, firstname, lastname, email, password, createdAt) VALUES (?, ?, ?, ?, ?,?)",
      [username, firstname, lastname, email, hashedPassword, formattedTimestamp]
    );

    return res
      .status(StatusCodes.CREATED) // Using StatusCodes
      .json({ Msg: "User created successfully." });
  } catch (error) {
    console.log(error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ Msg: "Internal server error." });
  }
}

async function login(req, res) {
  const { usernameOrEmail, password } = req.body;
  // console.log(email, password);
  // Check if email and password are provided
  if (!usernameOrEmail || !password) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      Msg: "Your email or password is incorrect. Please check your details and try again.",
    });
  }

  try {
    // Query the user by email or username
    const [user] = await dbConnection.query(
      "SELECT username, userid, password FROM users WHERE email = ? OR username = ?",
      [usernameOrEmail, usernameOrEmail]
    );

    // Check if user exists
    if (user.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        msg: "Invalid credentials. Please check your details and try again.", // user not found but we dont want to tell this to the users directly
      });
    }

    // Compare the password
    const isMatch = await bcrypt.compare(password, user[0].password);
    if (!isMatch) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        msg: "Invalid credentials. Please check your details and try again.", // password is wrong but we dont want to specify that clearly here
      });
    }

    // Generate JWT token
    const username = user[0].username;
    const userid = user[0].userid;
    const secret = process.env.JWT_SECRET;
    // console.log(username, userid);
    const token = jwt.sign({ username, userid }, secret, {
      expiresIn: "1d", // Token expires in 1 day
    });

    // Return the token and success message
    return res.status(StatusCodes.OK).json({
      msg: "User logged in successfully",
      token: token,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ Msg: "Internal server error." });
  }
}

function check(req, res) {
  const username = req.user.username;
  const userid = req.user.userid;
  return res.status(StatusCodes.OK).json({ username, userid });
}

//forgot password function
const nodemailer = require("nodemailer");

// at the top of the file
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // e.g. your Gmail address
    pass: process.env.EMAIL_PASS, // App password or real password
  },
});

async function forgotPassword(req, res) {
  const { email } = req.body;

  if (!email) return res.status(400).json({ msg: "Email required." });

  try {
    const [user] = await dbConnection.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    if (user.length === 0) {
      return res.status(404).json({ msg: "Email not found." });
    }

    // Create a token (in production, use a more secure and short expiry)
    const resetToken = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;

    // Send email
    await transporter.sendMail({
      from: `"Evangadi Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Reset your password",
      html: `
        <p>You requested a password reset.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>This link will expire in 15 minutes.</p>
      `,
    });

    return res
      .status(200)
      .json({ msg: "Password reset link has been sent to your email." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Server error." });
  }
}

module.exports = { login, register, check, forgotPassword };
