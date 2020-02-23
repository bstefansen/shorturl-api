// Import Modules
var dns = require("dns");
var express = require("express");
var mongo = require("mongodb");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
require('dotenv').config();

var cors = require("cors");

var app = express();

// Mongoose Configuration
const Schema = mongoose.Schema;

const urlSchema = new Schema(
  {
    original_url: String,
    short_url: String
  },
  { timestamps: true }
);

const Model = mongoose.model("shortUrl", urlSchema);

// Basic Configuration
var port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGOLAB_URI, { useNewUrlParser: true });
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

app.use(express.static(__dirname + "/public"));

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/views/index.html");
});

// Posts and returns short URL JSON
app.post("/api/shorturl/new", (req, res) => {
  var original = req.body.URL;
  dns.lookup(original, (err, address, family) => {
    console.log("address: %j family: IPv%s", address, family);
    if (err !== null) {
      res.json({
        error: "invalid URL"
      });
    } else {
      var data = new Model({
        original_url: original,
        short_url: Math.floor(Math.random() * 1000 + 1)
      });

      data.save(function(err) {
        if (err) return console.error(err);
      });

      return res.json({ data });
    }
  });
});

// Generates short URL route
app.get("/api/shorturl/:urlToForward", (req, res) => {
  var shorterURL = req.params.urlToForward;

  Model.findOne({ short_url: shorterURL }, (err, data) => {
    res.redirect(301, "http://" + data.original_url);

    var urlregex = new RegExp("^(http|https)://", "i");
    var stringToCheck = data.originalUrl;

    if (urlregex.test(stringToCheck) === true) {
      res.redirect(301, data.originalUrl);
    } else {
      res.redirect(301, "http://" + data.originalUrl);
    }
  });
});

//---------- DO NOT EDIT BELOW THIS LINE --------------------
app.listen(port, function() {
  console.log("Node.js listening on port:" + port);
});
