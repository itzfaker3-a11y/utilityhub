import { Router, type IRouter } from "express";
import healthRouter from "./health";
import toolsRouter from "./tools";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/tools", toolsRouter);

export default router;
