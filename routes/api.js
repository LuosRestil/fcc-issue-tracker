/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";

var expect = require("chai").expect;
let ObjectID = require("mongodb").ObjectID;

module.exports = function(app, db) {
  app
    .route("/api/issues/:project")

    .get(function(req, res) {
      console.log("get request...");
      var project = req.params.project;
      if (req.query) {
        db.collection(project)
          .find(req.query)
          .toArray((err, docs) => {
            if (err) {
              res.send("unable to process request");
            } else {
              res.send(docs);
            }
          });
      } else {
        db.collection(project).find.toArray((err, data) => {
          if (err) {
            res.send("unable to process request");
          } else {
            res.send(data);
          }
        });
      }
    })

    .post(function(req, res) {
      if (
        !req.body.issue_title ||
        !req.body.issue_text ||
        !req.body.created_by
      ) {
        res.send("missing input(s)");
      } else {
        var project = req.params.project;
        db.collection(project).insertOne(
          {
            issue_title: req.body.issue_title,
            issue_text: req.body.issue_text,
            created_by: req.body.created_by,
            assigned_to: req.body.assigned_to,
            status_text: req.body.status_text,
            created_on: new Date(),
            updated_on: new Date(),
            open: true
          },
          (err, doc) => {
            if (err) {
              res.send("error");
            } else {
              res.send(doc.ops[0]);
            }
          }
        );
      }
    })

    .put(function(req, res) {
      let id = req.body._id;
      var project = req.params.project;
      let keys = Object.keys(req.body);
      delete req.body._id;
      if (req.body.open) {
        req.body.open = false;
      }
      for (let key of keys) {
        if (!req.body[key]) {
          delete req.body[key];
        }
      }
      if (Object.keys(req.body) == 0) {
        res.send("no updated field sent");
      } else {
        req.body.updated_on = new Date();
        db.collection(project).updateOne(
          { _id: ObjectID(id) },
          { $set: req.body },
          { upsert: true },
          err => {
            if (err) {
              res.send(`could not update ${id}`);
            } else {
              res.send("successfully updated");
            }
          }
        );
      }
    })

    .delete(function(req, res) {
      console.log("delete route...");
      var project = req.params.project;
      if (req.body._id) {
        console.log("user entered id");
        db.collection(project).deleteOne(
          { _id: ObjectID(req.body._id) },
          (err, data) => {
            if (err) {
              console.log("error");
              res.send(`could not delete ${req.body._id}`);
            } else {
              console.log("success");
              res.send(`deleted ${req.body._id}`);
            }
          }
        );
      } else {
        console.log("no id sent");
        res.send("_id error");
      }
    });
};
