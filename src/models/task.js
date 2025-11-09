import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, default: '' },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users',
            required: true,
        },
        members: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users',
        }],
        totalElapsedMs: { type: Number, default: 0 }
    },
    { timestamps: true }
);
taskSchema.index({ members: 1 });

const Task = mongoose.model('tasks', taskSchema);
export default Task;
