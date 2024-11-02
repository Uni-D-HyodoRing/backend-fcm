const express = require("express");

const app = express();
const portnum = 8082;

// HTTP Server
app.get("/", (req, res) => {
    res.send(`<h1>Main Page</h1>`);
});

// 404 Error Handler
app.use(function (req, res, next) {
    res.status(404).send("404 Error: Page Not Found");
});

// Start Server on Port ${portnum}
app.listen(portnum, () => {
    console.log("Listening on " + portnum);
});
