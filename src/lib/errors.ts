import { Context } from "hono";
import { TypedResponse } from "hono";

export abstract class HttpError extends Error {
    constructor(message: string) {
        super(message);
    }

    abstract handle(context: Context): Promise<Response & TypedResponse<any>>;
}

class PersonNotFoundError extends HttpError {
    constructor(id: number) {
        super(`Person ${id} can not be found`);
    }

    async handle(context: Context<any, any, {}>): Promise<Response & TypedResponse<any>> {
        context.status(404);
        return context.json({ message: this.message });
    }
}

class UserDoesNotExistError extends HttpError {
    constructor(uniqueIdentifier: string) {
        super(`${uniqueIdentifier} does not exist`);
    }

    async handle(context: Context<any, any, {}>): Promise<Response & TypedResponse<any>> {
        context.status(404);
        return context.json({ message: this.message });
    }
}

class EmailIsUnavailableError extends HttpError {
    constructor(email: string) {
        super(`${email} is unavailable`);
    }

    async handle(context: Context<any, any, {}>): Promise<Response & TypedResponse<any>> {
        context.status(409);
        return context.json({ message: this.message });
    }
}

export { PersonNotFoundError, EmailIsUnavailableError, UserDoesNotExistError };
