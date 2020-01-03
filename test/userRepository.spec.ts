import { Connection, ConnectionOptions, createConnection, getConnection, getCustomRepository } from "typeorm";
import { UserEntity } from "../src/entities/UserEntity";
import { UserRepository } from "../src/repository/UserRepository";
import * as assert from "assert";
import * as fs from "fs";
import { isUser } from "../src/User";

const testName = "testName";
const testPassword = "testPassword";
const testMessage = "testMessage";


function deleteDB() {
    try {
        fs.unlinkSync("userRepositoryTestDB");
    } catch (err) {
        console.log(err);
    }
}

describe("getByName", () => {
    let connection: Connection;
    let userRepository: UserRepository;

    before(async () => {
        try {
            connection = await createConnection("userRepositoryTestConnection");
            await connection.synchronize(); // connectionOptions の entities の database schema を作成
            userRepository = getConnection("userRepositoryTestConnection").getCustomRepository(UserRepository); 

            const user = userRepository.create(); // const user = new UserEntity() と同じ
            user.name = testName;
            user.password = testPassword;
            await userRepository.save(user);
        } catch (err) {
            console.log(err);
        }
    });

    after(async () => {
        await connection.close();
        deleteDB();
    });

    it("returns User object", async () => {
        const testUser = await userRepository.getByName(testName);
        console.log(testUser);
        assert.strictEqual(isUser(testUser), true);
        assert.strictEqual(testUser.name, testName);
    });
});

describe("hasName", () => {
    let connection: Connection;
    let userRepository: UserRepository;

    before(async () => {
        try {
            connection = await createConnection("userRepositoryTestConnection");
            await connection.synchronize(); // connectionOptions の entities の database schema を作成
            userRepository = getConnection("userRepositoryTestConnection").getCustomRepository(UserRepository); 

            const user = userRepository.create(); // const user = new UserEntity() と同じ
            user.name = testName;
            user.password = testPassword;
            await userRepository.save(user);
        } catch (err) {
            console.log(err);
        }
    });

    after(async () => {
        await connection.close();
        deleteDB();
    });

    it("return true when user exists", async () => {
        assert.equal(await userRepository.hasName(testName), true);
    });
    it("returns false when user doesn't exist", async () => {
        assert.equal(await userRepository.hasName("not exsit"), false);
    });
});
