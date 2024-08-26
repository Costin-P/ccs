const express = require("express");
const router = express.Router();
const Notifications = require("../models/notifications");
// const Users = require("../models/Users");

router.post("/logNotification", async (req, res) => {
 try {
  const { data } = req.body;
  console.log(`Sending notification ${data.car} ${new Date().toLocaleTimeString("en-gb")}`);
  Notifications({ car: data.car, date: data.date }).save();

  // Example:
  // Notify the user via the app and play a specific sound
  // const user_app_id = await Users.find({car: data.car})
  // sendNotificationToRoadUser(user_app_id, `New notification to car ${data.car}`);

  return res.end();
 } catch (error) {
  console.log(error.message);
  res.status(400).json({ message: error.message });
 }
});

router.post("/logsData/:limit", async (req, res) => {
 try {
  await Notifications.find({})
   .sort({ date: -1 })
   .limit(req.params.limit)
   .then((data) => {
    res.json({ succes: true, data: data });
   });
 } catch (error) {
  console.log(error.message);
  res.status(400).json({ message: error.message });
 }
});

router.post("/logsChartData", async (req, res) => {
 try {
  const data = await Notifications.aggregate([
   {
    $group: {
     _id: "$car", // Group by the car field
     count: { $sum: 1 }, // Count the occurrences of each car
    },
   },
   {
    $project: {
     _id: 0, // Exclude the default MongoDB _id field
     car: "$_id", // Rename _id to car
     count: 1, // Include the count field
    },
   },
   {
    $sort: { count: -1 }, // Sort by count in descending order
   },
  ]);

  res.json({ success: true, data: data });
 } catch (error) {
  console.log(error.message);
  res.status(400).json({ message: error.message });
 }
});

module.exports = router;
