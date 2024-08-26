import React, { useState, useEffect, useCallback } from "react";
import Logs from "@/comp/Logs";
import Chart1 from "@/comp/Chart1";
import { ApiService } from "@/service/ApiService";
import Ambulance from "./assets/Ambulance";

const LOG_NOTIFICATIONS = true;

export default function App() {
 const streetCount = 6;
 const streetLength = 10;
 const carSpeed = 0.03;

 const [mission, setMission] = useState(false);

 const [vehicles, setVehicles] = useState([
  // Ambulance
  {
   type: "ambulance",
   carReg: "Ambulance",
   x: 20,
   y: 30,
   direction: { axis: "x", dir: "-" },
   route: null,
   rest: 3,
  },
  // Cars
  {
   type: "car",
   carReg: "ABC 1234",
   x: 0,
   y: 0,
   changeDirectionAfterTurns: 3,
   direction: { axis: "x", dir: "+" },
  },
  {
   type: "car",
   carReg: "XYZ 5678",
   x: 10,
   y: 10,
   changeDirectionAfterTurns: 3,
   direction: { axis: "x", dir: "-" },
  },
  {
   type: "car",
   carReg: "DS 21 LMN",
   x: 20,
   y: 10,
   changeDirectionAfterTurns: 3,
   direction: { axis: "y", dir: "+" },
  },
  {
   type: "car",
   carReg: "UI 23 DSD",
   x: 30,
   y: 20,
   changeDirectionAfterTurns: 3,
   direction: { axis: "y", dir: "-" },
  },
  {
   type: "car",
   carReg: "PAS1",
   x: 30,
   y: 30,
   changeDirectionAfterTurns: 3,
   direction: { axis: "y", dir: "-" },
  },
  {
   type: "car",
   carReg: "WV 67 DFG",
   x: 30,
   y: 40,
   changeDirectionAfterTurns: 3,
   direction: { axis: "y", dir: "-" },
  },
  {
   type: "car",
   carReg: "HJK 4567",
   x: 30,
   y: 50,
   changeDirectionAfterTurns: 3,
   direction: { axis: "y", dir: "-" },
  },
 ]);

 // Calculate total size of the grid
 const gridSize = (streetCount - 1) * streetLength + 1;

 const renderGrid = () => {
  return [...Array(gridSize)].map((_, y) =>
   [...Array(gridSize)].map((_, x) => {
    const isStreet = x % streetLength === 0 || y % streetLength === 0;
    return <GridCell key={`${x}-${y}`} isStreet={isStreet} />;
   })
  );
 };

 useEffect(() => {
  const interval = setInterval(() => {
   setVehicles((prevVehicles) => {
    return prevVehicles.map((vehicle) => {
     if (vehicle.type === "car") {
      // Determine if the car should stop
      const isCloseToAmbulance =
       mission &&
       vehicles.some(
        (v) => v.type === "ambulance" && calculateDistance(vehicle.x, vehicle.y, v.x, v.y) <= 9
       );

      // If the car is close to an ambulance, set the car to be stopped
      if (isCloseToAmbulance && mission !== "Awaiting mission") {
       return {
        ...vehicle, // dont update its gps
       };
      } else {
       // Car movement logic (unchanged)
       let newX = vehicle.x;
       let newY = vehicle.y;
       let newDirection = { ...vehicle.direction };

       // Determine if the car should change direction
       if (
        vehicle[vehicle.direction.axis] % 10 === 0 ||
        vehicle[vehicle.direction.axis] === 0 ||
        vehicle[vehicle.direction.axis] === 50
       ) {
        if (vehicle.changeDirectionAfterTurns <= 0) {
         // Randomly decide new direction if at an intersection
         newDirection.axis = Math.random() < 0.5 ? "x" : "y";
         newDirection.dir = Math.random() < 0.5 ? "+" : "-";
         vehicle.changeDirectionAfterTurns = 3; // Reset after changing direction
        }
        vehicle.changeDirectionAfterTurns--;
       }

       // Move in the current direction
       if (newDirection.axis === "x") {
        let newVal =
         newDirection.dir === "+" ? Math.min(gridSize, newX + 1) : Math.max(0, newX - 1);
        newX = newVal > 50 ? 50 : newVal < 0 ? 0 : newVal;
       } else if (newDirection.axis === "y") {
        let newVal =
         newDirection.dir === "+" ? Math.min(gridSize, newY + 1) : Math.max(0, newY - 1);
        newY = newVal > 50 ? 50 : newVal < 0 ? 0 : newVal;
       }

       return {
        ...vehicle,
        x: newX,
        y: newY,
        direction: newDirection,
        changeDirectionAfterTurns: vehicle.changeDirectionAfterTurns,
       };
      }
     } else if (vehicle.type === "ambulance") {
      // Ambulance movement logic
      if (vehicle.route) {
       const vpos = { x: vehicle.x, y: vehicle.y };
       const routeIndex = vehicle.route.findIndex((gps) => gps.x == vpos.x && gps.y == vpos.y);

       // If the ambulance is at the last position in the route
       if (routeIndex === vehicle.route.length - 1) {
        return {
         ...vehicle,
         route: false, // Set route to false when the last point is reached
        };
       } else {
        // Move to the next position in the route
        return {
         ...vehicle,
         x: vehicle.route[routeIndex + 1]?.x,
         y: vehicle.route[routeIndex + 1]?.y,
         direction: {
          axis: vehicle.route[routeIndex + 1].x !== vehicle.x ? "x" : "y",
          dir:
           vehicle.route[routeIndex + 1].x > vehicle.x ||
           vehicle.route[routeIndex + 1].y > vehicle.y
            ? "+"
            : "-",
         },
        };
       }
      } else {
       if (!mission) {
        setMission("pending");

        return {
         ...vehicle,
        };
       } else if (mission === "pending") {
        return {
         ...vehicle,
        };
       } else {
        if (mission.x === vehicle.x && mission.y === vehicle.y) {
         setMission(false);
        } else {
         const newRoute = getRoute({ x: vehicle.x, y: vehicle.y }, mission, gridSize);
         return {
          ...vehicle,
          route: newRoute,
         };
        }
       }
      }
     }
     return vehicle;
    });
   });
  }, carSpeed * 1000);

  return () => clearInterval(interval);
 }, [carSpeed, gridSize, streetLength, vehicles]);

 useEffect(() => {
  if (mission === "pending") {
   setTimeout(() => {
    const destination = getRandomCoordinates(gridSize, streetLength);
    setMission(destination);
   }, 3000);
   // const newRoute = getRoute({ x: vehicle.x, y: vehicle.y }, destination, gridSize);

   setMission("Awaiting mission");
  }
 }, [mission]);

 const calculateDistance = (x1, y1, x2, y2) => {
  return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
 };

 const getRandomCoordinates = () => {
  const randomX =
   Math.floor(Math.random() * ((streetCount * streetLength) / streetLength)) * streetLength;
  const randomY =
   Math.floor(Math.random() * ((streetCount * streetLength) / streetLength)) * streetLength;
  return { x: randomX, y: randomY };
 };

 const getRoute = (start, end, gridSize) => {
  const queue = [[start]];
  const visited = new Set();
  visited.add(`${start.x},${start.y}`);

  const directions = [
   { x: 1, y: 0 }, // Right
   { x: -1, y: 0 }, // Left
   { x: 0, y: 1 }, // Down
   { x: 0, y: -1 }, // Up
  ];

  while (queue.length > 0) {
   const path = queue.shift();
   const { x, y } = path[path.length - 1];

   if (x === end.x && y === end.y) {
    return path;
   }

   for (const dir of directions) {
    const newX = x + dir.x;
    const newY = y + dir.y;

    if (
     newX >= 0 &&
     newX < gridSize &&
     newY >= 0 &&
     newY < gridSize &&
     !visited.has(`${newX},${newY}`)
    ) {
     visited.add(`${newX},${newY}`);
     queue.push([...path, { x: newX, y: newY }]);
    }
   }
  }

  return [];
 };

 const [log, setLog] = useState([]);

 const notifyCar = (carReg) => {
  const now = new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' });
  const logEntry = log.findIndex((entry) => entry.carReg === carReg);

  if (logEntry < 0) {
   // create one
   let tempData = {
    carReg,
    now,
   };

   setLog((prev) => [...prev, tempData]);
  }
 };

 const postLog = (data) => {
  ApiService("api/logNotification", data);
 };

 useEffect(() => {
  if (log.length == 0) return;
  const interval = setInterval(() => {
   // Create a copy of the current log entries

   if (log.length > 0) {
    log.forEach((entry) => postLog({ car: entry.carReg, date: entry.now }));
    setLog([]); // Clear the log after posting
   }
  }, 5000); // every 5 seconds process the data

  return () => clearInterval(interval); // Cleanup interval on component unmount
 }, [log]); // Empty dependency array

 return (
  <div className="min-h-[100svh] w-full flex flex-col items-center justify-start bg-blue-500/50 overflow-x-hidden gap-y-4">
   <p className="mt-8 text-lg bg-white p-2 rounded-lg mb-4">Backend System Visualisation</p>

   <div className="w-full flex flex-col items-center justify-center px-4 mb-4">
    <div
     className="relative grid w-[500px] h-[300px]"
     style={{
      gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
      gridTemplateRows: `repeat(${gridSize}, 1fr)`,
     }}>
     {/* Grid Points */}
     {renderGrid()}

     {/* Cars */}
     {vehicles.map((vehicle, index) => {
      const isCloseToAmbulance =
       vehicle.type === "car" &&
       mission &&
       vehicles.some(
        (v) => v.type === "ambulance" && calculateDistance(vehicle.x, vehicle.y, v.x, v.y) <= 9
       );

      if (isCloseToAmbulance &&  mission &&  mission !== "Awaiting mission" && LOG_NOTIFICATIONS) {
       notifyCar(vehicle.carReg);
      }

      return (
       <div
        key={vehicle.carReg}
        className={`absolute rounded-full w-3 h-3 flex justify-center items-center`}
        style={{
         top: `${vehicle.y * (100 / gridSize)}%`,
         left: `${vehicle.x * (100 / gridSize)}%`,
         transition: `all ${carSpeed + 0.05}s linear`,
        }}>
        <div
         className={`flex flex-col justify-center items-center relative text-center rounded-full`}>
         {isCloseToAmbulance && mission !== "Awaiting mission" && vehicle.type === "car" && (
          <span className="absolute -top-1/3 text-red-400 font-bold">!</span>
         )}
         {vehicle.type === "ambulance" ? (
          <span
           className={`text-3xl ${mission !== "Awaiting mission" ? "" : "opacity-60"} ${
            vehicle.direction.axis === "x" && vehicle.direction.dir === "-" ? "rota" : ""
           }`}>
           <Ambulance />
          </span>
         ) : (
          <span className={`text-3xl`}>🚘</span>
         )}

         <span className="text-[9px]">
          {vehicle.x},{vehicle.y}
         </span>
         {vehicle.carReg && (
          <span className="text-[9px] whitespace-nowrap absolute -bottom-1/3">
           {vehicle.carReg}
          </span>
         )}
        </div>
       </div>
      );
     })}
    </div>
   </div>

   <div className="grid grid-cols-2 gap-2 mt-4 ">
    <div className="grid grid-cols-2 w-[500px] gap-2 h-full text-xl">
     <div className="flex flex-col bg-white flex-1 p-2 rounded-lg shadow-md shadow-black/30 whitespace-nowrap">
      <p className="">Server:</p>
      <p className="font-semibold">🟢 Online</p>
     </div>
     <div className="flex flex-col bg-white flex-1 p-2 rounded-lg shadow-md shadow-black/30">
      <p className="">Cars:</p>
      <p className="font-semibold">🚘 {vehicles.filter((veh) => veh.type === "car").length}</p>
     </div>
     <div className="flex flex-col bg-white flex-1 p-2 rounded-lg shadow-md shadow-black/30">
      <p className="">Ambulance:</p>
      <p className={`font-semibold`}>
       🚑 {vehicles.filter((veh) => veh.type === "ambulance").length}
      </p>
     </div>
     <div className="flex flex-col bg-white flex-1 min-w-[105px] p-2 rounded-lg shadow-md shadow-black/30">
      <p>Mission:</p>

      <p className="font-semibold flex flex-nowrap gap-x-1">
       <span
        className={`${
         mission !== "Awaiting mission" ? "animate-colorFlash" : "bg-green-200"
        } rounded-full w-[16px] h-[16px] block my-auto ml-[3px]`}
       />
       {mission &&
        mission !== "Pending" &&
        mission !== "Awaiting mission" &&
        Object.values(mission).toString()}
       {mission === "Awaiting mission" && mission}
      </p>
     </div>
    </div>

    <Logs />

    <Chart1 />
   </div>
  </div>
 );
}

const GridCell = React.memo(({ isStreet }) => {
 return <div className={`relative w-full h-full ${isStreet ? "bg-gray-200" : "bg-transparent"}`} />;
});
