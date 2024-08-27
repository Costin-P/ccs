const express = require("express");
const router = express.Router();
const Notifications = require("../models/notifications");
// const Users = require("../models/Users");

router.post("/logNotification", async (req, res) => {
 try {
  const { data } = req.body;
  console.log("🚀 ~ router.post ~ data:", data.date);

  const [datePart, timePart] = data.date.split(", ");
  const [day, month, year] = datePart.split("/");
  const isoDate = `${year}-${month}-${day}T${timePart}`;
  const dateObject = new Date(isoDate);
  const isDST =
   dateObject.getTimezoneOffset() <
   Math.max(
    new Date(dateObject.getFullYear(), 0, 1).getTimezoneOffset(),
    new Date(dateObject.getFullYear(), 6, 1).getTimezoneOffset()
   );

  // If it's daylight saving time, add one hour
  if (isDST) {
   dateObject.setHours(dateObject.getHours() + 1);
  }

  console.log(`Sending notification ${data.car} ${dateObject}`);
  Notifications({ car: data.car, date: new Date(dateObject).toISOString() }).save();

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
  const { fromDate, toDate } = req.body.data;

  let from = new Date(fromDate);
  let to = new Date(toDate);

  const isDST =
   from.getTimezoneOffset() <
   Math.max(
    new Date(from.getFullYear(), 0, 1).getTimezoneOffset(),
    new Date(from.getFullYear(), 6, 1).getTimezoneOffset()
   );

  // If it's daylight saving time, add one hour
  if (isDST) {
   from.setHours(from.getHours() + 1);
   to.setHours(to.getHours() + 1);
  }

  // Validate the dates
  if (isNaN(from.getTime()) || isNaN(to.getTime()) || from > to) {
   // Return default data if dates are invalid
   const data = await Notifications.aggregate([
    {
     $group: {
      _id: "$car", // Group by the car field
      count: { $sum: 1 }, // Count the occurrences of each car
     },
    },
    {
     $project: {
      _id: 0,
      car: "$_id", // Rename _id to car
      count: 1, // Include the count field
     },
    },
    {
     $sort: { count: -1 }, // Sort by count in descending order
    },
   ]);

   return res.json({ success: true, data: data });
  } else {
   const data = await Notifications.aggregate([
    {
     $match: {
      date: {
       $gte: from, // Use Date objects for matching
       $lte: to,
      },
     },
    },
    {
     $group: {
      _id: "$car", // Group by the car field
      count: { $sum: 1 }, // Count the occurrences of each car
     },
    },
    {
     $project: {
      _id: 0,
      car: "$_id", // Rename _id to car
      count: 1, // Include the count field
     },
    },
    {
     $sort: { count: -1 }, // Sort by count in descending order
    },
   ]);

   return res.json({ success: true, data: data });
  }
 } catch (error) {
  console.log(error.message);
  res.status(400).json({ message: error.message });
 }
});

module.exports = router;
