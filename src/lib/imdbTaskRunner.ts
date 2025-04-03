import { addImgImdb } from "@/services/imdbService";
import TaskStatus from "@/db/models/TaskStatus";
import { IMovie } from "@/db/models/Movie";
import dbConnect from "@/db/mongodb";

export async function runImgTask(taskId: string, movies: IMovie[]) {
  await dbConnect();
  try {
    await addImgImdb(movies);
    await TaskStatus.findOneAndUpdate({ taskId }, { status: "done" });
  } catch (error) {
    console.error("addImgImdb failed:", error);
    await TaskStatus.findOneAndUpdate({ taskId }, { status: "failed" });
  }
}
