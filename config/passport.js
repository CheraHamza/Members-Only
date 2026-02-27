import passport from "passport";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { Strategy as LocalStrategy } from "passport-local";
import { pool } from "../storage/pool.js";
import bcrypt from "bcryptjs";

const PGStore = connectPgSimple(session);

export function sessionMiddleware() {
	const sessionStore = new PGStore({
		pool,
	});

	return session({
		secret: process.env.SECRET,
		resave: false,
		saveUninitialized: false,
		store: sessionStore,
		cookie: {
			maxAge: 1000 * 60 * 60 * 24,
		},
	});
}

passport.use(
	new LocalStrategy(
		{ usernameField: "email", passwordField: "password" },
		async (email, password, done) => {
			try {
				const { rows } = await pool.query(
					`SELECT * from users where email = $1`,
					[email],
				);

				const user = rows[0];

				if (!user) {
					return done(null, false, {
						field: "email",
						message: "Email not found.",
					});
				}

				const match = await bcrypt.compare(password, user.password);

				if (!match) {
					return done(null, false, {
						field: "password",
						message: "Incorrect password.",
					});
				}

				return done(null, user);
			} catch (err) {
				return done(err);
			}
		},
	),
);

export const isAuth = (req, res, next) => {
	if (req.isAuthenticated()) {
		next();
	} else {
		res.status(401).redirect("/login");
	}
};

export const isAnonymous = (req, res, next) => {
	if (!req.isAuthenticated()) {
		next();
	} else {
		res.redirect("/");
	}
};

export const isAdmin = (req, res, next) => {
	if (req.isAuthenticated() && req.user.admin) {
		next();
	} else {
		res.status(401).redirect("/");
	}
};

passport.serializeUser((user, done) => {
	done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
	try {
		const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [
			id,
		]);
		const user = rows[0];

		done(null, user);
	} catch (err) {
		done(err);
	}
});
