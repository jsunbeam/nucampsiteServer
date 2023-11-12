const express = require("express");
const authenticate = require("../authenticate");
const cors = require("./cors");
const Favorite = require("../models/favorite");
const favoriteRouter = express.Router();

favoriteRouter
  .route("/")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, authenticate.verifyUser, (req, res) => {
    Favorite.find({ user: req.user._id })
      .populate("user")
      .populate("favorites")
      .then((favorites) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(favorites);
      });
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    Favorite.findOne({ user: req.user._id }).then((favorite) => {
      if (favorite) {
        req.body.forEach((fav) => {
          if (!favorite.campsites.includes(fav._id)) {
            favorite.campsites.push(fav._id);
          }
        });
      } else {
        //create a new favorite document for this user
        Favorite.create({ user: req.user._id }).then((favorite) => {
          req.body.forEach((fav) => {
            favorite.campsites.push(fav._id);
          });
          favorite.save().then((favorite) => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(favorite);
          });
        });
      }
    });
  })
  .put(cors.corsWithOptions, authenticate.verifyUser)
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    Favorite.findOneAndDelete({ user: req.user._id }).then((favorite) => {
      if (favorite) {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(favorite);
      } else {
        res.setHeader("Content-Type", "text/plain");
        res.end("You do not have any favorites to delete.");
      }
    });
  });

favoriteRouter
  .route("/:campsiteId")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(
      `GET operation not supported on /favorites/${req.params.campsiteId}`
    );
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    Favorite.findOne({ user: req.user._id }).then((favorite) => {
      if (favorite) {
        const campsiteId = req.params.campsiteId;
        if (!favorite.campsites.includes(campsiteId)) {
          favorite.campsites.push(campsiteId);
          favorite.save();
        } else {
          res.end("That campsite is already in the list of favorites!");
        }
      } else {
        Favorite.create({ user: req.user._id }).then((favorite) => {
          favorite.campsites.push(req.params.campsiteId);
        });
      }
    });
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(
      `PUT operation not supported on /favorites/${req.params.campsiteId}`
    );
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    Favorite.findOne({ user: req.user._id }).then((favorite) => {
      if (favorite) {
        const index = favorite.campsites.indexOf(req.params.campsiteId);
        favorite.campsites.splice(index, 1);
        favorite.save().then((favorite) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(favorite);
        });
      } else {
        res.setHeader("Content-Type", "text/plain");
        res.end("There are no favorites to delete.");
      }
    });
  });

module.exports = favoriteRouter;
