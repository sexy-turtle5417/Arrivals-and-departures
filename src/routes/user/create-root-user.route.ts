import { Hono } from "hono";
import { Context } from "hono";
import { personFactory, userFactory } from "../../../app.config";
import { HttpError } from "../../lib/errors";

export const createRootUserRoute = new Hono();

type UserResponse = {
    id: string;
    email: string;
    admin: boolean;
    disabled: boolean;
    timeRegistered: Date;
    personalInfo: {
        firstname: string;
        middlename: string | null;
        lastname: string;
        sex: string;
        profileImageURL: string;
    };
};

type CreateUserRequest = {
    email: string;
    password: string;
    admin?: boolean;
    personalInfo: {
        firstname: string;
        middlename?: string;
        lastname: string;
        sex: "male" | "female";
    };
};

createRootUserRoute.post("/root", async (context: Context) => {
    const requestBody = (await context.req.json()) as CreateUserRequest;
    const person = await personFactory.insertAndCreate(requestBody.personalInfo);
    const { personalInfo, ...guardData } = requestBody;
    const data = { ...guardData, personId: person.getId() };
    try {
        const user = await userFactory.insertAndCreate(data);
        context.status(201);
        return context.json<UserResponse>({
            id: user.getId(),
            email: user.getEmail(),
            admin: user.isAdmin(),
            disabled: user.isDisabled(),
            timeRegistered: user.getTimeRegistered(),
            personalInfo: {
                firstname: person.getFirstname(),
                middlename: person.getMiddlename(),
                lastname: person.getLastname(),
                sex: person.getSex(),
                profileImageURL: person.getProfileImageURL(),
            },
        });
    } catch (error) {
        await person.delete();
        if (error instanceof HttpError) return error.handle(context);
        throw error;
    }
});
