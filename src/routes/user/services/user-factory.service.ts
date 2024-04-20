import { PrismaClient, Guard as RawPrismaUserData } from "@prisma/client";
import { inject, injectable } from "tsyringe";
import { EmailIsUnavailableError, UserDoesNotExistError } from "../../../lib/errors";

export interface User {
    updateEmail(email: string): Promise<User>;
    updatePassword(password: string): Promise<User>;
    updateAdminStatus(status: boolean): Promise<User>;
    updateActiveStatus(status: boolean): Promise<User>;
    getId(): string;
    getEmail(): string;
    getPassword(): string;
    isAdmin(): boolean;
    isDisabled(): boolean;
    getTimeRegistered(): Date;
    getPersonId(): number;
}

type UserCreationData = {
    email: string;
    password: string;
    personId: number;
    admin?: boolean;
};

export interface UserFactory {
    insertAndCreate(data: UserCreationData): Promise<User>;
    retrieveAndCreateById(id: string): Promise<User>;
    retrieveAndCreateByEmail(email: string): Promise<User>;
}

class PrismaUser implements User {
    private id: string;
    private email: string;
    private password: string;
    private admin: boolean;
    private disabled: boolean;
    private timeRegisterd: Date;
    private personId: number;

    private prismaClient: PrismaClient;

    constructor(data: RawPrismaUserData, prismaClient: PrismaClient) {
        this.id = data.id;
        this.email = data.email;
        this.password = data.password;
        this.admin = data.admin;
        this.disabled = data.disabled;
        this.personId = data.personId;
        this.timeRegisterd = data.timeRegistered;
        this.prismaClient = prismaClient;
    }

    private async emailTaken(email: string): Promise<boolean> {
        return (
            (await this.prismaClient.guard.count({ where: { email } })) > 0 &&
            this.email.toLowerCase() != email.toLowerCase()
        );
    }

    async updateEmail(email: string): Promise<User> {
        if (await this.emailTaken(email)) throw new Error();
        const data = await this.prismaClient.guard.update({
            data: { email },
            where: { id: this.getId() },
        });
        this.email = data.email;
        return this;
    }

    async updatePassword(password: string): Promise<User> {
        const data = await this.prismaClient.guard.update({
            data: { password },
            where: { id: this.getId() },
        });
        this.password = data.password;
        return this;
    }

    async updateAdminStatus(status: boolean): Promise<User> {
        const data = await this.prismaClient.guard.update({
            data: { admin: status },
            where: { id: this.getId() },
        });
        this.admin = data.admin;
        return this;
    }

    async updateActiveStatus(status: boolean): Promise<User> {
        const data = await this.prismaClient.guard.update({
            data: { disabled: !status },
            where: { id: this.getId() },
        });
        this.disabled = data.disabled;
        return this;
    }

    getId(): string {
        return this.id;
    }
    getEmail(): string {
        return this.email;
    }
    getPassword(): string {
        return this.password;
    }
    isAdmin(): boolean {
        return this.admin;
    }
    isDisabled(): boolean {
        return this.disabled;
    }

    getPersonId(): number {
        return this.personId;
    }

    getTimeRegistered(): Date {
        return this.timeRegisterd;
    }
}

@injectable()
class PrismaUserFactory implements UserFactory {
    private prismaClient: PrismaClient;

    constructor(@inject("prismaClient") prismaClient: PrismaClient) {
        this.prismaClient = prismaClient;
    }

    private async existByEmail(email: string): Promise<boolean> {
        return (await this.prismaClient.guard.count({ where: { email } })) > 0;
    }

    private async existById(id: string): Promise<boolean> {
        return (await this.prismaClient.guard.count({ where: { id } })) > 0;
    }

    async insertAndCreate(data: UserCreationData): Promise<User> {
        if (await this.existByEmail(data.email)) throw new EmailIsUnavailableError(data.email);
        const prismaData = await this.prismaClient.guard.create({ data });
        return new PrismaUser(prismaData, this.prismaClient);
    }

    async retrieveAndCreateById(id: string): Promise<User> {
        if (!(await this.existById(id))) throw new UserDoesNotExistError(id);
        const data = await this.prismaClient.guard.findUniqueOrThrow({ where: { id } });
        return new PrismaUser(data, this.prismaClient);
    }

    async retrieveAndCreateByEmail(email: string): Promise<User> {
        if (!(await this.existByEmail(email))) throw new UserDoesNotExistError(email);
        const data = await this.prismaClient.guard.findUniqueOrThrow({ where: { email } });
        return new PrismaUser(data, this.prismaClient);
    }
}

export { PrismaUserFactory };
