import * as assert from "assert";
import * as fs from "fs";
import { DatabaseManager } from "../src/server/database/DatabaseManager";
import { UserEntity } from "../src/server/database/entity/UserEntity";
import { UserRepository } from "../src/server/database/repository/UserRepository";
import { User, isUser } from "../src/common/User";

const testName = "testName";
const testPassword = "testPassword";

function deleteDB(databasePath: string) {
    try {
        fs.unlinkSync(databasePath);
    } catch (err) {
        console.log(err);
    }
}

describe("getById", () => {
    let databaseManager: DatabaseManager;
    let userRepository: UserRepository;
    let userId: number;

    before(async () => {
        try {
            databaseManager = await DatabaseManager.getInstance();
            userRepository = databaseManager.getRepository(UserRepository);

            const user = userRepository.create(); // const user = new UserEntity() と同じ
            user.name = testName;
            user.password = testPassword;
            await userRepository.save(user);
            userId = userRepository.getId(user);
        } catch (err) {
            console.log(err);
        }
    });

    after(async () => {
        await databaseManager.closeConnection();
        deleteDB(databaseManager.getDatabasePath());
    });

    it("returns User object", async () => {
        const testUser = await userRepository.getById(userId);
        assert.strictEqual(isUser(testUser), true);
        assert.strictEqual(testUser.id, userId);
        assert.strictEqual(testUser.name, testName);
        assert.strictEqual(testUser.password, testPassword);
    });
});

describe("getByName", () => {
    let databaseManager: DatabaseManager;
    let userRepository: UserRepository;

    before(async () => {
        try {
            databaseManager = await DatabaseManager.getInstance();
            userRepository = databaseManager.getRepository(UserRepository);

            const user = userRepository.create(); // const user = new UserEntity() と同じ
            user.name = testName;
            user.password = testPassword;
            await userRepository.save(user);
        } catch (err) {
            console.log(err);
        }
    });

    after(async () => {
        await databaseManager.closeConnection();
        deleteDB(databaseManager.getDatabasePath());
    });

    it("returns User object", async () => {
        const testUser = await userRepository.getByName(testName);
        assert.strictEqual(isUser(testUser), true);
        assert.strictEqual(testUser.name, testName);
        assert.strictEqual(testUser.password, testPassword);
    });
});

describe("hasName", () => {
    let databaseManager: DatabaseManager;
    let userRepository: UserRepository;

    before(async () => {
        try {
            databaseManager = await DatabaseManager.getInstance();
            userRepository = databaseManager.getRepository(UserRepository);

            const user = userRepository.create(); // const user = new UserEntity() と同じ
            user.name = testName;
            user.password = testPassword;
            await userRepository.save(user);
        } catch (err) {
            console.log(err);
        }
    });

    after(async () => {
        await databaseManager.closeConnection();
        deleteDB(databaseManager.getDatabasePath());
    });

    it("return true when user exists", async () => {
        assert.strictEqual(await userRepository.hasName(testName), true);
    });
    it("returns false when user doesn't exist", async () => {
        assert.strictEqual(await userRepository.hasName("not exsit"), false);
    });
});

describe("insertAndGetId", () => {
    let databaseManager: DatabaseManager;
    let userRepository: UserRepository;

    before(async () => {
        try {
            databaseManager = await DatabaseManager.getInstance();
            userRepository = databaseManager.getRepository(UserRepository);
                
        } catch (err) {
            console.log(err);
        }
    });

    after(async () => {
        await databaseManager.closeConnection();
        deleteDB(databaseManager.getDatabasePath());
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

describe("updatePassById", () => {
    let databaseManager: DatabaseManager;
    let userRepository: UserRepository;
    let id: number;
    let testUser: User;

    before(async () => {
        try {
            databaseManager = await DatabaseManager.getInstance();
            userRepository = databaseManager.getRepository(UserRepository);

            id = await userRepository.insertAndGetId(testName, testPassword);
            testUser = await userRepository.getByName(testName);
        } catch (err) {
            console.log(err);
        }
    });

    after(async () => {
        await databaseManager.closeConnection();
        deleteDB(databaseManager.getDatabasePath());
    });

    it("update username and password", async () => {
        const password = "updatedpass";
        await userRepository.updatePassById(id, password);
        const updatedUser = await userRepository.getByName(testName);
        testUser.password = password;
        assert.deepStrictEqual(testUser, updatedUser);
    });
});

describe("updateNameById", () => {
    let databaseManager: DatabaseManager;
    let userRepository: UserRepository;
    let id: number;
    let testUser: User;

    before(async () => {
        try {
            databaseManager = await DatabaseManager.getInstance();
            userRepository = databaseManager.getRepository(UserRepository);

            id = await userRepository.insertAndGetId(testName, testPassword);
            testUser = await userRepository.getByName(testName);
        } catch (err) {
            console.log(err);
        }
    });

    after(async () => {
        await databaseManager.closeConnection();
        deleteDB(databaseManager.getDatabasePath());
    });

    it("update username and password", async () => {
        const name = "updatedname";
        await userRepository.updateNameById(id, name);
        const updatedUser = await userRepository.getByName(name);
        testUser.name = name;
        assert.deepStrictEqual(testUser, updatedUser);
    });
});

describe("getEntityById", () => {
    let databaseManager: DatabaseManager;
    let userRepository: UserRepository;
    let userId: number;

    before(async () => {
        try {
            databaseManager = await DatabaseManager.getInstance();
            userRepository = databaseManager.getRepository(UserRepository);
                
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
        await databaseManager.closeConnection();
        deleteDB(databaseManager.getDatabasePath());
    });

    it("returns UserEntity object", async () => {
        const userEntity = await userRepository.getEntityById(userId);
        assert.strictEqual(userEntity.id, userId);
        assert.strictEqual(userEntity.name, testName);
        assert.strictEqual(userEntity.password, testPassword);
    });
});
