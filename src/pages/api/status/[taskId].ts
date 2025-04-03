import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/db/mongodb";
import TaskStatus from "@/db/models/TaskStatus";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { taskId } = req.query;

  if (typeof taskId !== "string") {
    return res.status(400).json({ status: "invalid_task_id" });
  }

  try {
    await dbConnect();

    const record = await TaskStatus.findOne({ taskId });

    if (!record) {
      return res.status(404).json({ status: "not_found" });
    }

    return res.status(200).json({ status: record.status });
  } catch (err) {
    console.error("Error fetching task status:", err);
    return res
      .status(500)
      .json({ status: "error", error: "Internal server error" });
  }
}
