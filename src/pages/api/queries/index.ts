import Query from "@/db/models/Query";
import dbConnect from "@/db/mongodb";
import type { NextApiRequest, NextApiResponse } from "next";
import handleApiError from "@/lib/handleApiError";

export default async function queriesHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();

  switch (req.method) {
    case "GET":
      return getAllQueries(res);
    case "POST":
      return postQuery(req, res);
    default:
      return res.status(405).json({ status: "Method Not Allowed" });
  }
}

const postQuery = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const newQuery = await Query.create(req.body);
    return res
      .status(201)
      .json({ success: true, status: "Query created", data: newQuery });
  } catch (error) {
    return handleApiError(res, "Error creating movie", error, 400);
  }
};

const getAllQueries = async (res: NextApiResponse) => {
  try {
    const queries = await Query.find();
    return res
      .status(queries.length ? 200 : 404)
      .json(queries.length ? queries : { status: "Not Found" });
  } catch (error) {
    return handleApiError(res, "Error fetching queries", error);
  }
};
