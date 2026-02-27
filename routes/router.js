import { Router } from "express";
import * as controller from "../controllers/controller.js";
import { isAdmin, isAnonymous, isAuth } from "../config/passport.js";

export const router = Router();

router.get("/", controller.getRoot);

router.get("/signup", isAnonymous, controller.getSignup);
router.post("/signup", isAnonymous, controller.postSignup);

router.get("/login", isAnonymous, controller.getLogin);
router.post("/login", isAnonymous, controller.postLogin);

router.get("/post", isAuth, controller.getPost);
router.post("/post", isAuth, controller.createPost);

router.post("/logout", isAuth, controller.postLogout);

router.post("/delete", isAdmin, controller.postDelete);
