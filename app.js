import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res, next) => {
	res.render("index");
});

app.listen(3000, (error) => {
	if (error) {
		throw error;
	}
	console.log("app listening on port 3000!");
});
