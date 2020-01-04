import { 
    Connection, 
    ConnectionOptions, 
    createConnection, 
    getConnection, 
    getCustomRepository 
} from "typeorm";
import { UserEntity } from "../src/server/entity/UserEntity";
import { UserRepository } from "../src/server/repository/UserRepository";
import * as assert from "assert";
import * as fs from "fs";
import { User, isUser } from "../src/common/User";

const connectionType: string = process.env.TYPEORM_CONNECTION_TYPE || "default";
const testName = "testName";
const testPassword = "testPassword";

function deleteDB() {
    try {
        fs.unlinkSync("testDB");
    } catch (err) {
        console.log(err);
    }
}

describe("getByName", () => {
    let connection: Connection;
    let userRepository: UserRepository;

    before(async () => {
        try {
            connection = await createConnection(connectionType);
            userRepository = getConnection(connectionType)
                .getCustomRepository(UserRepository); 

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
            connection = await createConnection(connectionType);
            userRepository = getConnection(connectionType)
                .getCustomRepository(UserRepository); 

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

describe("insertAndGetId", () => {
    let connection: Connection;
    let userRepository: UserRepository;

    before(async () => {
        try {
            connection = await createConnection(connectionType);
            userRepository = getConnection(connectionType)
                .getCustomRepository(UserRepository); 
        } catch (err) {
            console.log(err);
        }
    });

    after(async () => {
        await connection.close();
        deleteDB();
    });

    it("returns id of inserted User", async () => {
        const id = await userRepository.insertAndGetId(testName, testPassword);
        const id2 = await userRepository.insertAndGetId(testName + "2", testPassword);
        const testUser = await userRepository.getByName(testName);
        const testUser2 = await userRepository.getByName(testName + "2");

        if (testUser) {
            assert.strictEqual(id === testUser.id, true);
            assert.strictEqual(id2 === testUser2.id, true);
        } else {
            assert.strictEqual(testUser === undefined, false);
        }
    });
});

describe("updateById", () => {
    let connection: Connection;
    let userRepository: UserRepository;
    let id: number;
    let testUser: User;

    before(async () => {
        try {
            connection = await createConnection(connectionType);
            userRepository = getConnection(connectionType)
                .getCustomRepository(UserRepository); 

            id = await userRepository.insertAndGetId(testName, testPassword);
            testUser = await userRepository.getByName(testName);
        } catch (err) {
            console.log(err);
        }
    });

    after(async () => {
        await connection.close();
        deleteDB();
    });

    it("update username and password", async () => {
        const name = "updatedname";
        const password = "updatedpass";
        await userRepository.updateById(id, name, password);
        const updatedUser = await userRepository.getByName(name);
        testUser.name = name;
        testUser.password = password;
        assert.deepStrictEqual(testUser, updatedUser);
    });
});

describe("getEntityById", () => {
    let connection: Connection;
    let userRepository: UserRepository;
    let userId: number;

    before(async () => {
        try {
            connection = await createConnection(connectionType);
            userRepository = getConnection(connectionType)
                .getCustomRepository(UserRepository); 

            const userEntity = userRepository.create(); // const user = new UserEntity() と同じ
            userEntity.name = testName;
            userEntity.password = testPassword;
            await userRepository.save(userEntity);
            userId = userRepository.getId(userEntity);
        } catch (err) {
            console.log(err);
        }
    });

    after(async () => {
        await connection.close();
        deleteDB();
    });

    it("returns UserEntity object", async () => {
        const userEntity = await userRepository.getEntityById(userId);
        assert.strictEqual(userEntity.id, userId);
        assert.strictEqual(userEntity.name, testName);
        assert.strictEqual(userEntity.password, testPassword);
    });
});
