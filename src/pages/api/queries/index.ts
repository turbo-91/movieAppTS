import Queries from "@/db/models/Queries";
import dbConnect from "@/db/mongodb";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();
  if (req.method === "GET") {
    const queries = await Queries.find();
    if (!queries || queries.length === 0) {
      return res.status(404).json({ status: "Not Found" });
    }
    return res.status(200).json(queries);
  } else {
    return res.status(405).json({ status: "Method Not Allowed" });
  }
}
