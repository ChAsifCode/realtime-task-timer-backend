import AppRoutes from "./src/routes/index.js";
import app from "./src/middlewares/appRouteMiddlewares.js";
import ENV from "./src/config/keys.js";
import print from "./src/utils/print.js";
import DB from "./src/config/db.js";
import attachIO from "./src/middlewares/attachIO.js";
import { initSocket } from "./socket.js";
import { globalErrorHandlerMiddleware, handleApiNotFound, handleSIGINT, handleUncaughtException } from "./src/utils/globalErrorHandlers.js";

app.get("/", (req, res) => {
    res.send("Hello World!");
})
// apis
app.use("/api/v1", AppRoutes);

// route not found
app.use(handleApiNotFound);

// global error handler
app.use(globalErrorHandlerMiddleware);

// uncaught exception
process.on("uncaughtException", handleUncaughtException);

// unhandled rejection
process.on("unhandledRejection", handleSIGINT);

// if node process is terminated
process.on("SIGTERM", handleSIGINT);

const server = app.listen(ENV.PORT, () => {
    print("info", `Server is running on port ${ENV.PORT}...`);
    print("info", `This is ${process.env.NODE_ENV} environment...`);
    DB();
    initSocket(server);
});
// after initSocket:
app.use(attachIO);
