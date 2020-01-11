import { Connection, ObjectType, createConnection } from "typeorm";

export class DatabaseManager {

    private static readonly instance: DatabaseManager = new DatabaseManager();
    private connection!: Connection;

    private constructor() {}

    private async setConnection(connectionName: string = "default") {
        this.connection = await createConnection(connectionName);
    }

    private isConnected(): boolean {
        return this.connection && 
            this.connection.isConnected;
    }

    // データベースと接続されたただ一つの DatabaseMaanger を返す
    static async getInstance() {
        if (!DatabaseManager.instance.isConnected()) {
            await DatabaseManager.instance.setConnection(process.env.TYPEORM_CONNECTION_NAME);
        }
        return DatabaseManager.instance;
    }

    async closeConnection() {
        await this.connection.close();
    }

    getRepository<T>(customRepository: ObjectType<T>): T {
        return this.connection.getCustomRepository(customRepository);
    }

    getDatabasePath(): string {
        const databasePath: string | Uint8Array | undefined = this.connection.options.database;

        if (databasePath === undefined) {
            throw new Error("not configured");
        } else if (typeof databasePath === "string") {
            return databasePath;
        } else {
            return new TextDecoder("utf-8").decode(databasePath);
        }
    }
}
