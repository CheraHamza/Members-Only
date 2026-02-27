import { pool } from "./pool";

const initSQL = `
    CREATE TABLE users (
        id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        firstname VARCHAR (255),
        lastname VARCHAR (255),
        email VARCHAR (255),
        password VARCHAR (255),
        membership BOOLEAN,
        admin BOOLEAN
    );

    CREATE TABLE posts (
        id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        title VARCHAR (255),
        timestamp TIMESTAMP,
        content TEXT,
        user_id INTEGER,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
`;

await pool.query(initSQL);
