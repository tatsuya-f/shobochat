import { getCustomRepository } from "typeorm";
import { UserRepository } from "../src/repository/UserRepository";
import * as assert from "assert";
import * as fs from "fs";
import { isUser } from "../src/User";

const testName = "testName";
const testPassword = "testPassword";
const testMessage = "testMessage";

function deleteDB() {
    try {
        fs.unlinkSync("sqlite3.db");
    } catch (err) {
        console.log(err);
    }
}

describe("findByName", () => {
    const userRepository = getCustomRepository(UserRepository); 

    before(async () => {
        try {
            const userEntity = userRepository.create(); // same as const userEntity = new UserEntity();
            userEntity.name = testName;
            userEntity.password = testPassword;
            await userRepository.save(userEntity);
        } catch (err) {
            console.log(err);
        }
    });

    after(() => {
        deleteDB();
    });

    it("returns User object", async () => {
        const testUser = await userRepository.findByName(testName);
        assert.strictEqual(isUser(testUser), true);
        assert.strictEqual(testUser.name, testName);
    });
});
