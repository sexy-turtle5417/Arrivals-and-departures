import "reflect-metadata";
import { PrismaClient } from "@prisma/client";
import { container } from "tsyringe";
import { PersonFactory, PrismaPersonFactory } from "./src/routes/person/person-factory.service";
import { PrismaUserFactory, UserFactory } from "./src/routes/user/services/user-factory.service";

container.register<PrismaClient>("prismaClient", { useValue: new PrismaClient() });
container.register<PersonFactory>("personFactory", { useClass: PrismaPersonFactory });
container.register<UserFactory>("userFactory", { useClass: PrismaUserFactory });

export const personFactory = container.resolve<PersonFactory>(PrismaPersonFactory);
export const userFactory = container.resolve<UserFactory>(PrismaUserFactory);
