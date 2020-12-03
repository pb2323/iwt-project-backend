"use strict";
let express = require("express");
let app = express();
let bcrypt = require("bcrypt");
let uuid = require("uuid");
var cors = require("cors");
let path = require("path");
let fs = require("fs");
app.use(cors());
app.use(express.json());

app.post("/users/register", function (req, res) {
  let { uname, psw, email } = req.body;
  let hash = "";
  bcrypt.hash(psw, 10).then((hashedPassword) => {
    hash = hashedPassword;
    let id = uuid.v4();
    fs.readFile("./users.json", { encoding: "utf-8" }, (err, response) => {
      if (err) return res.json({ message: "Internal Server Error" });
      let users = JSON.parse(response);
      let userObj = {
        id: id,
        uname: uname,
        email: email,
        psw: hash,
        createdAt: new Date(),
      };
      users.push(userObj);
      let usersJSON = JSON.stringify(users);
      fs.writeFile("./users.json", usersJSON, (err) => {
        if (err) return res.json({ message: "Internal Server Error" });
        return res.json({ message: "Registration Successfull" });
      });
    });
  });
});

app.post("/users/login", (req, res) => {
  let { uname, psw } = req.body;
  fs.readFile("./users.json", { encoding: "utf-8" }, (err, response) => {
    if (err) return res.json({ message: "Internal Server Error" });
    let users = JSON.parse(response);
    let user = users.find((obj) => obj.uname === uname);
    if (!user) return res.json({ message: "User not found, Register First" });
    console.log(user);
    bcrypt
      .compare(psw, user.psw)
      .then((isMatched) => {
        if (!isMatched)
          return res.json({ message: "Wrong credentials, Login Again" });
        return res.status(201).json({ message: "Login Successfull" });
      })
      .catch((err) => {
        if (err) return res.json({ message: "Internal Server error" });
      });
  });
});

var PORT = 1234;
app.listen(PORT, function () {
  console.log("Server is listening ", PORT);
});
