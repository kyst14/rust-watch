import pkg from "pg";
import crypto from "crypto";
import "dotenv/config";

const { Pool } = pkg;

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined. Please set it in the .env file.");
}

export interface User {
    id: number;
    username: string;
    tg_id: number;
    created_at: Date;
    blocked: boolean;
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

class DataBase {
    constructor () {

    };

    async getUserById (id: number, username: string): Promise<User | null> {
        const client = await pool.connect();
        try {
            const result = await client.query("SELECT * FROM users WHERE id = $1", [id]);
            return result.rows[0] as User;
        } finally {
            client.release();
        }
    };

    async getUser (tg_id: number, username: string): Promise<User | null | "request create"> {
        const client = await pool.connect();
        try {
            const user = await client.query("SELECT * FROM users WHERE tg_id = $1", [tg_id]);
            
            if (user.rows.length > 0) {
                return user.rows[0] as User;
            } else {
                if (process.env.REQUEST_CREATE === "true") {
                    return "request create";
                } else {
                    const result = await this.createUser(tg_id, username);
                    return result.rows[0] as User;
                }
            }
        } finally {
            client.release();
        }
    };

    async createUser (tg_id: number, username: string): Promise<{ rows: User[] }> {
        const client = await pool.connect();
        try {
            // generate random id (length 8)
            const id = parseInt(crypto
                .createHash('sha256')
                .update(tg_id.toString() + Date.now().toString()).digest('hex')
                .slice(0, 8), 16);
            
            const result = await client.query("INSERT INTO users (tg_id, username, id) VALUES ($1, $2, $3) RETURNING *", [tg_id, username, id]);
            return result;
        } finally {
            client.release();
        }
    };

    async getUsers (limit?: number): Promise<{ rows: User[] }> {
        const client = await pool.connect();
        try {
            const result = await client.query(`SELECT * FROM users ${limit ? `LIMIT ${limit}` : ``}`, [limit]);
            return result;
        } finally {
            client.release();
        }
    };

    async checkToken (token: string): Promise<boolean | null | undefined> {
        const client = await pool.connect();
        try {
            const result = await client.query<{ valid: boolean }>("SELECT valid FROM tokens WHERE token = $1", [token]);
            return result.rows[0]?.valid ?? null;
        } finally {
            client.release();
        }
    }
}

export const db = new DataBase();
export default db;