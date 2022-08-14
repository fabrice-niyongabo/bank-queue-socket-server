require("dotenv").config();
const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
const cors = require("cors");
const Axios = require("axios");

app.use(cors());
app.set("socketio", io);
let connectedUsers = [];

const removeUser = (socketId) => {
  connectedUsers = connectedUsers.filter((user) => user.socketId !== socketId);
};

io.on("connection", (socket) => {
  console.log("A user connected");

  //take connected user's id
  socket.on("addUser", () => {
    console.log("user added");
  });

  //send to all users
  socket.on("disconnect", () => {
    console.log("A user disconnected");
    removeUser(socket.id);
    io.emit("getAllOnlineUsers", connectedUsers);
  });
});

app.get("/", (req, res) => {
  res.send("<h1>Queue socket </h1>");
});

app.get("/addclient", (req, res) => {
  const { value } = req.query;
  if (value) {
    if (value == true || value == 1) {
      const io = req.app.get("socketio");
      const date = new Date();
      io.emit("addClient", {
        id: "",
        name: "Anonymous",
        day: date.getDay(),
        month: date.getMonth(),
        year: date.getFullYear(),
        joinedTimeAndDate: date,
        leaveTimeAndDate: "-",
        status: "online",
      });
      Axios.get(
        process.env.API_URL +
          "/addclient/?day=" +
          date.getDate() +
          "&month=" +
          (date.getMonth() + 1) +
          "&year=" +
          date.getFullYear() +
          "&jsonDate=" +
          date
      )
        .then((res) => {
          console.log(res.data);
        })
        .catch((error) => console.log(error.message));
      return res.status(200).send("User added to queue!");
    } else {
      return res.status(401).send("No user to add to queue");
    }
  } else {
    return res.status(400).send("Invalid request");
  }
});

app.get("/removeclient", (req, res) => {
  const { value } = req.query;
  if (value) {
    if (value == true || value == 1) {
      const io = req.app.get("socketio");
      const date = new Date();
      Axios.get(process.env.API_URL + "/removeclient/?sd=" + date)
        .then((res) => {
          console.log(res.data);
        })
        .catch((error) => console.log(error.message));
      io.emit("removeClient", "");
      return res.status("User removed from the queue!");
    } else {
      return res.status(401).send("No user to remove from the queue");
    }
  } else {
    return res.status(400).send("Invalid request");
  }
});

const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

// user Object
// {
//   date joined
//   usename: anonymous
// }
