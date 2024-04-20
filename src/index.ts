import "reflect-metadata";
import "../app.config";
import { Context, Hono } from "hono";
import { serve } from "@hono/node-server";
import { userRoute } from "./routes/user/user.route";
import { HttpError } from "./lib/errors";

const app = new Hono();
app.route("/api/v1/users", userRoute);

app.onError((error: Error, context: Context) => {
    if (error instanceof HttpError) return error.handle(context);
    console.error(error);
    context.status(500);
    return context.json({ message: "server error" });
});

serve(app, () => console.log("server started on port 3000"));
