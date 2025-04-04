import mongoose from "mongoose";

const TaskStatusSchema = new mongoose.Schema({
  taskId: { type: String, required: true, unique: true },
  status: {
    type: String,
    enum: ["processing", "done", "failed"],
    required: true,
  },
});

export default mongoose.models.TaskStatus ||
  mongoose.model("TaskStatus", TaskStatusSchema);
