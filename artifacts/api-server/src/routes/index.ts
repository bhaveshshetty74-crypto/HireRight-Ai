import { Router, type IRouter } from "express";
import healthRouter from "./health";
import rolesRouter from "./roles";
import candidatesRouter from "./candidates";
import screeningsRouter from "./screenings";
import aiRouter from "./ai";
import analyticsRouter from "./analytics";

const router: IRouter = Router();

router.use(healthRouter);
router.use(rolesRouter);
router.use(candidatesRouter);
router.use(screeningsRouter);
router.use(aiRouter);
router.use(analyticsRouter);

export default router;
