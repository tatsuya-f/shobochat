import { Connection, ObjectType, createConnection } from "typeorm";

export class DatabaseManager {

    private static readonly instance: DatabaseManager = new DatabaseManager();
    private _connection!: Connection;

    private constructor() {}

    static getInstance(): DatabaseManager {
        /*
         * Database に接続されていないDatabaseManager 
         * を返すのを許容しているのは，
         * グローバルで getInstance を可能にするためである．
         * もしもここで，Database に接続されていない DatabaseManager を返せない
         * ようにすると，実行時（動的）に getInstance より前で initialize() をしていたとしても
         * トランスパイル時に getInstance によってグローバル変数への代入をしている
         * 部分が先に実行されるため，エラーがでてしまう．
         *
         * initialize されていない場合のエラー処理は，private な getter 内で行う．
         */
        return DatabaseManager.instance;
    }

    /* 
     * public method から，DatabaseManager のメンバーにアクセスする場合
     * DatabaseManager が initialize されていない可能性があるので
     * エラー処理が行われている以下の private な getter を使用する
     */ 
    // <private getter>
    private isInitialized(): boolean {
        return this._connection && 
            this._connection.isConnected;
    }

    private get connection() {
        if (!DatabaseManager.instance.isInitialized()) {
            console.log("databaseManager hasn't been intialized");
            throw new Error("databaseManager hasn't been intialized");
        }
        return this._connection;
    }
    // </private getter>

    // <initialize>
    static async initialize() {
        try {
            await DatabaseManager.instance
                .setUpConnection(process.env.TYPEORM_CONNECTION_NAME);
        } catch (err) {
            console.log(err);
            throw new Error("initialize failed");
        }
    }

    private async setUpConnection(connectionName: string = "default") {
        this._connection = await createConnection(connectionName);
    }
    // </initialize>

    // <public method>
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
    // </public method>
}
