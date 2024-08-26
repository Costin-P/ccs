import React, { useEffect, useState } from "react";
import { ApiService } from "@/service/ApiService";

export default function Logs() {
 const [logs, setLogs] = useState([]);

 const fetchLogs = async () => {
  const recordsToFetch = 15;

  ApiService(`api/logsData/${recordsToFetch}`).then(async (response) => {
   const { data } = await response;
   if (data) {
    setLogs(data);
   }
  });
 };

 useEffect(() => {
  const interval = setInterval(() => fetchLogs(), 5000);

  return () => clearInterval(interval);
 }, []);

 return (
  <div className="flex flex-col h-[200px] overflow-y-scroll w-[500px] bg-white p-2 rounded-lg shadow-md shadow-black/30">
    {logs.length == 0 && <p>Loading...</p> }
   {logs.length > 0 &&
    logs.map((log) => (
     <div key={log._id} className={`flex flex-nowrap gap-x-2`}>
      <p className="text-[7px]">{new Date(log.date).toLocaleString("en-gb")}</p>
      <p className="text-sm">Car reg {log.car} notified</p>
     </div>
    ))}
  </div>
 );
}
