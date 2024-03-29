import { Router } from "express";
import { LocationService } from "./LocationService.js";

const locationRouter = Router();

// location 명칭 조회 for dropdown
locationRouter.get("/location", async function (req, res, next) {
  try {
    const data = await LocationService.getData();
    const name = data.map((object) => {
      return object.name;
    });

    res.status(200).send(name);
  } catch (error) {
    next(error);
  }
});
export { locationRouter };
