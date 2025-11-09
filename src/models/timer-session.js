import mongoose from 'mongoose';

const timerSessionSchema = new mongoose.Schema(
    {
        task: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'tasks',
            required: true, index: true
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users', required: true, index: true
        },
        startedAt: {
            type: Date,
            required: true,
        },
        stoppedAt: { type: Date, default: null },
        elapsedMs: { type: Number, default: 0 }
    },
    { timestamps: true }
);

timerSessionSchema.index(
    { task: 1, user: 1, stoppedAt: 1 },
    { unique: true, partialFilterExpression: { stoppedAt: null } }
);

const TimerSession = mongoose.model('timerSessions', timerSessionSchema);
export default TimerSession;
