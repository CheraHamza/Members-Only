import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { router } from "./routes/router.js";
import { sessionMiddleware } from "./config/passport.js";
import passport from "passport";
import "./config/passport.js";

const app = express();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.use(sessionMiddleware());
app.use(passport.session());

app.use((req, res, next) => {
	res.locals.currentUser = req.user;
	next();
});

app.use("/", router);

// 404 — no route matched
app.use((req, res) => {
	res.status(404).render("error", {
		title: "Page Not Found",
		message: "The page you're looking for doesn't exist.",
	});
});

// Global error handler — catches anything passed to next(err)
app.use((err, req, res, next) => {
	console.error(err);
	res.status(err.status || 500).render("error", {
		title: "Something Went Wrong",
		message:
			process.env.NODE_ENV === "production"
				? "An unexpected error occurred. Please try again later."
				: err.message,
	});
});

app.listen(3000, (error) => {
	if (error) {
		throw error;
	}
	console.log("app listening on port 3000!");
});
