import { pool } from "./pool.js";

export async function addUser(
	firstname,
	lastname,
	email,
	password,
	membership,
	admin,
) {
	await pool.query(
		`
            INSERT INTO users (firstname, lastname, email, password, membership, admin) VALUES ($1, $2, $3, $4, $5, $6);
        `,
		[firstname, lastname, email, password, membership, admin],
	);
}

export async function emailExists(email) {
	const { rows } = await pool.query(
		`
        SELECT * FROM users where email = $1;
        `,
		[email],
	);

	const exists = rows.length > 0;

	return exists;
}

export async function addPost(userId, title, content, timestamp) {
	await pool.query(
		`
			INSERT INTO posts (user_Id, title, content, timestamp) VALUES ($1, $2, $3, $4);
		`,
		[userId, title, content, timestamp],
	);
}

export async function getAllPosts() {
	const { rows } = await pool.query(
		`
			SELECT * FROM posts ORDER BY timestamp DESC;
		`,
	);

	return rows;
}

export async function getUserById(id) {
	const { rows } = await pool.query(
		`
			SELECT * FROM users where id = $1;
		`,
		[id],
	);

	return rows[0];
}

export async function deletePost(postId) {
	await pool.query(
		`
			DELETE FROM posts WHERE id = $1;
		`,
		[postId],
	);
}
