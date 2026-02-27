import {
	addUser,
	emailExists,
	addPost,
	getAllPosts,
	getUserById,
	deletePost,
} from "../storage/queries.js";
import { body, validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import passport from "passport";
import dotenv from "dotenv";
import { formatDistance, formatRelative } from "date-fns";

dotenv.config();

const alphaErr = "must only contain alphebetic characters.";
const nameLengthErr = "must be between 3 and 200 characters.";
const emailErr = "must be a valid email format.";

export const getRoot = async (req, res, next) => {
	try {
		const posts = await getAllPosts();

		for (const post of posts) {
			const user = await getUserById(post.user_id);
			const author = user.firstname + " " + user.lastname;
			post.author = author;
			
			const distance = formatDistance(post.timestamp, new Date());
			post.timestamp = distance.includes('day') ? formatRelative(post.timestamp, new Date()) : distance;
		}

		res.render("index", { posts });
	} catch (err) {
		next(err);
	}
};

export const getSignup = (req, res) => {
	res.render("sign-up");
};

const validateSignup = [
	body("firstname")
		.trim()
		.notEmpty()
		.withMessage("cannot be empty.")
		.matches(/^[A-Za-z ]+$/)
		.withMessage(alphaErr)
		.isLength({ min: 3, max: 200 })
		.withMessage(nameLengthErr),

	body("lastname")
		.trim()
		.notEmpty()
		.withMessage("cannot be empty.")
		.matches(/^[A-Za-z ]+$/)
		.withMessage(alphaErr)
		.isLength({ min: 3, max: 200 })
		.withMessage(nameLengthErr),

	body("email")
		.trim()
		.toLowerCase()
		.notEmpty()
		.withMessage("cannot be empty")
		.isEmail()
		.withMessage(emailErr)
		.custom(async (value) => {
			const exists = await emailExists(value);

			if (exists) {
				throw new Error("Email already in use");
			}

			return true;
		})
		.withMessage("email already in use."),

	body("password")
		.trim()
		.notEmpty()
		.withMessage("cannot be empty")
		.isStrongPassword({
			minLength: 8,
			minLowercase: 2,
			minUppercase: 1,
			minNumbers: 1,
			minSymbols: 0,
			returnScore: false,
		})
		.withMessage(
			"must be at least 8 characters with at least 2 lowercase letters, 1 uppercase letter, and 1 number.",
		),

	body("confirmPassword")
		.trim()
		.notEmpty()
		.withMessage("cannot be empty")
		.custom((value, { req }) => {
			if (value !== req.body.password) {
				throw new Error("passwords do not match");
			}
			return true;
		})
		.withMessage("passwords do not match"),

	body("admin")
		.trim()
		.optional()
		.custom((value) => {
			if (value && value !== process.env.ADMIN_CODE) {
				throw new Error("Invalid admin secret");
			}
			return true;
		})
		.withMessage("Invalid secret admin code."),

	body("membership")
		.trim()
		.optional()
		.custom((value) => {
			if (value && value !== process.env.SPECIAL_MEMBER_CODE) {
				throw new Error("Invalid special member secret");
			}
			return true;
		})
		.withMessage("Invalid secret membership code."),
];

export const postSignup = [
	validateSignup,
	async (req, res, next) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				const groupedErrors = errors.array().reduce((acc, { path, msg }) => {
					(acc[path] ||= []).push(msg);
					return acc;
				}, {});

				return res.status(400).render("sign-up", {
					errors: groupedErrors,
					previousValues: req.body,
				});
			}

			const { firstname, lastname, email, password, membership, admin } =
				req.body;

			const hashedPassword = await bcrypt.hash(password, 10);

			let membershipStatus = false;
			let adminStatus = false;

			if (admin && admin === process.env.ADMIN_CODE) {
				membershipStatus = true;
				adminStatus = true;
			} else if (membership && membership === process.env.SPECIAL_MEMBER_CODE) {
				membershipStatus = true;
			}

			await addUser(
				firstname,
				lastname,
				email,
				hashedPassword,
				membershipStatus,
				adminStatus,
			);
			res.redirect("/login");
		} catch (err) {
			return next(err);
		}
	},
];

export const getLogin = (req, res) => {
	res.render("login");
};

export const postLogin = (req, res, next) => {
	passport.authenticate("local", (err, user, info) => {
		if (err) return next(err);

		if (!user) {
			const authErrors = {};

			if (info?.field && info?.message) {
				authErrors[info.field] = [info.message];
			}

			return res.status(401).render("login", {
				authErrors,
				previousValues: { email: req.body.email || "" },
			});
		}

		req.logIn(user, (loginErr) => {
			if (loginErr) return next(loginErr);
			return res.redirect("/");
		});
	})(req, res, next);
};

export const getPost = (req, res) => {
	res.render("create-post");
};

const validatePost = [
	body("title")
		.trim()
		.notEmpty()
		.withMessage("cannot be empty.")
		.isLength({ min: 10, max: 500 })
		.withMessage("must be between 10 and 500 characters."),

	body("content")
		.trim()
		.notEmpty()
		.withMessage("cannot be empty.")
		.isLength({ min: 10, max: 2000 })
		.withMessage("must be between 10 and 2000 characters."),
];

export const createPost = [
	validatePost,
	async (req, res, next) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				const groupedErrors = errors.array().reduce((acc, { path, msg }) => {
					(acc[path] ||= []).push(msg);
					return acc;
				}, {});

				return res.status(400).render("create-post", {
					errors: groupedErrors,
					previousValues: req.body,
				});
			}

			const user = req.user;
			const { title, content } = req.body;
			const timestamp = new Date();

			await addPost(user.id, title, content, timestamp);
			res.redirect("/");
		} catch (err) {
			return next(err);
		}
	},
];

export const postDelete = async (req, res, next) => {
	try {
		const { postId } = req.body;

		await deletePost(postId);

		res.redirect("/");
	} catch (err) {
		next(err);
	}
};

export const postLogout = (req, res, next) => {
	req.logout((err) => {
		if (err) {
			return next(err);
		}
		res.redirect("/");
	});
};
