const { Router } = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const { check, validationResult } = require("express-validator");
const User = require("../models/User");
const router = Router();

// /api/auth/register
router.post(
  "/register",
  [
    check("password", "Минимальная длина пароля 6-символов!").isLength({
      min: 6
    })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
          message: "Некорректные данные при регистрации!"
        });
      }

      const { userName, password } = req.body;
      const candidate = await User.findOne({ userName });

      if (candidate) {
        return res
          .status(400)
          .json({ message: "Пользователь с таким именем уже существует" });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const user = new User({ userName, password: hashedPassword });

      await user.save();
      res.status(201).json({ message: "Пользователь создан" });
    } catch (error) {
      res.status(500).json({ message: "Server error!" });
    }
  }
);

// /api/auth/login
router.post(
  "/login",
  [check("password", "Введите пароль").exists()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
          message: "Некорректные данные при авторизации!"
        });
      }

      const { userName, password } = req.body;

      const user = await User.findOne({ userName });

      if (!user) {
        return res
          .status(400)
          .json({ message: "Такой пользователь не существует!" });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({ message: "Неверная пара логин/пароль!" });
      }

      const token = jwt.sign({ userId: user.id }, config.get("jwtSecret"), {
        expiresIn: "1h"
      });
      res.json({ token, userId: user.id });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;
