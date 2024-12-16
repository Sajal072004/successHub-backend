const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client"); 

const prisma = new PrismaClient();
const router = express.Router();


const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid token" });
    }
    req.user = user;
    next();
  });
};


router.post("/signup", async (req, res) => {
  const { email, name, password } = req.body;

  try {
    
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    
    const hashedPassword = bcrypt.hashSync(password, 10);

   
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    });

    console.log("New User Created:", newUser);

    
    const token = jwt.sign(
      { email: newUser.email, name: newUser.name },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({ message: "User signed up successfully", token });
  } catch (error) {
    console.error("Error in /signup:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  console.log("user signin " , req.body);
  try {
   
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

  if(password) { const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

  }
    const token = jwt.sign(
      { email: user.email, name: user.name, avatarUrl: user.avatarUrl },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.status(200).json({ message: "User signed in successfully", token });
  } catch (error) {
    console.error("Error in /signin:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


router.get("/user/me", authenticateToken, async (req, res) => {
  try {
    
    const user = await prisma.user.findUnique({
      where: { email: req.user.email },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    
    res.status(200).json({
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    console.error("Error in /user/me:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
