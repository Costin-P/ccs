import React, { useEffect, useState, useCallback } from "react";
import {
 BarChart,
 Bar,
 Rectangle,
 XAxis,
 YAxis,
 CartesianGrid,
 Tooltip,
 Legend,
 ResponsiveContainer,
 LabelList,
} from "recharts";
import { ApiService } from "@/service/ApiService";

export default function Chart1() {
 const [data, setData] = useState([]);

 const fetchData = useCallback(async () => {

  const response = await ApiService(`api/logsChartData`)
  const { data: newData } = await response;
  
  if (!newData) return;

  // Compare new data with the current state
  if (JSON.stringify(newData) !== JSON.stringify(data)) {
   setData(newData);
  }
 }, [data]); 

 useEffect(() => {
  const interval = setInterval(() => {
   fetchData();
  }, 5000);

  return () => clearInterval(interval);
 }, [fetchData]);

 return (
  <div className="flex flex-col w-full h-[50vh] bg-white py-4 my-4 rounded-lg shadow-md shadow-black/40 text-xs font-semibold col-span-full">
   <p className="text-lg text-center">Amount of times a specific car has been notified</p>
   
   {data.length == 0 && <p className="m-auto">Loading...</p> }
   <ResponsiveContainer width="100%" height="100%">
    <BarChart
     width={150}
     height={40}
     data={data}
     margin={{
      top: 30,
      right: 35,
      left: 5,
      bottom: 5,
     }}
     barSize={"80%"}>
     <Bar dataKey="count" fill="#8884d8">
      <LabelList dataKey="count" position="top" />
      <LabelList dataKey="car" position="inside" angle={310} fill="#000" />
     </Bar>

     <YAxis dataKey="count" />
    </BarChart>
   </ResponsiveContainer>
  </div>
 );
}
