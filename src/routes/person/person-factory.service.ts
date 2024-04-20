import { PrismaClient, Person as RawPrismaPersonData } from "@prisma/client";
import { inject, injectable } from "tsyringe";
import { PersonNotFoundError } from "../../lib/errors";

export interface Person {
    updateFirstname(firstname: string): Promise<Person>;
    updateMiddlename(middlename: string): Promise<Person>;
    updateLastname(lastname: string): Promise<Person>;
    updateSex(sex: "male" | "female"): Promise<Person>;
    updateProfileImageURL(profileImageURL: string): Promise<Person>;
    getId(): number;
    getFirstname(): string;
    getMiddlename(): string | null;
    getLastname(): string;
    getSex(): "male" | "female";
    getProfileImageURL(): string;
    delete(): Promise<void>;
}

type PersonData = {
    firstname: string;
    middlename?: string;
    lastname: string;
    sex: "male" | "female";
};

export interface PersonFactory {
    insertAndCreate(data: PersonData): Promise<Person>;
    retrieveAndCreateById(id: number): Promise<Person>;
}

class PrismaPerson implements Person {
    private id: number;
    private firstname: string;
    private middlename: string | null;
    private lastname: string;
    private sex: "male" | "female";
    private profileImageURL: string;

    private prismaClient: PrismaClient;

    constructor(data: RawPrismaPersonData, prismaClient: PrismaClient) {
        this.id = data.id;
        this.firstname = data.firstname;
        this.middlename = data.middlename;
        this.lastname = data.lastname;
        this.sex = data.sex;
        this.profileImageURL = data.profileImageURL;
        this.prismaClient = prismaClient;
    }

    async updateFirstname(firstname: string): Promise<Person> {
        const data = await this.prismaClient.person.update({
            data: { firstname },
            where: { id: this.getId() },
        });
        this.firstname = data.firstname;
        return this;
    }

    async updateMiddlename(middlename: string): Promise<Person> {
        const data = await this.prismaClient.person.update({
            data: { middlename },
            where: { id: this.getId() },
        });
        this.middlename = data.middlename;
        return this;
    }

    async updateLastname(lastname: string): Promise<Person> {
        const data = await this.prismaClient.person.update({
            data: { lastname },
            where: { id: this.getId() },
        });
        this.lastname = data.lastname;
        return this;
    }

    async updateSex(sex: "male" | "female"): Promise<Person> {
        const data = await this.prismaClient.person.update({
            data: { sex },
            where: { id: this.getId() },
        });
        this.sex = data.sex;
        return this;
    }

    async updateProfileImageURL(profileImageURL: string): Promise<Person> {
        const data = await this.prismaClient.person.update({
            data: { profileImageURL },
            where: { id: this.getId() },
        });
        this.profileImageURL = data.profileImageURL;
        return this;
    }

    getId(): number {
        return this.id;
    }

    getFirstname(): string {
        return this.firstname;
    }

    getMiddlename(): string | null {
        return this.middlename;
    }

    getLastname(): string {
        return this.lastname;
    }

    getSex(): "male" | "female" {
        return this.sex;
    }

    getProfileImageURL(): string {
        return this.profileImageURL;
    }

    async delete(): Promise<void> {
        await this.prismaClient.person.delete({ where: { id: this.getId() } });
    }
}

@injectable()
export class PrismaPersonFactory implements PersonFactory {
    private prismaClient: PrismaClient;

    constructor(@inject("prismaClient") prismaClient: PrismaClient) {
        this.prismaClient = prismaClient;
    }

    async insertAndCreate(data: PersonData): Promise<Person> {
        const prismaData = await this.prismaClient.person.create({ data });
        return new PrismaPerson(prismaData, this.prismaClient);
    }

    async retrieveAndCreateById(id: number): Promise<Person> {
        const data = await this.prismaClient.person.findUnique({ where: { id } });
        if (!data) throw new PersonNotFoundError(id);
        return new PrismaPerson(data, this.prismaClient);
    }
}
