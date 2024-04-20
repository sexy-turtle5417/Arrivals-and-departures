import { Hono } from "hono";
import { createRootUserRoute } from "./create-root-user.route";

export const userRoute = new Hono();
userRoute.route("/", createRootUserRoute);
