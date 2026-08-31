import express from "express";
import { wrap } from "../../utils/adminQuery.js";
import * as L from "../../controllers/admin/listingsController.js";

const router = express.Router();

// Hotels
router.get("/hotels", wrap(L.listHotels));
router.post("/hotels", wrap(L.createHotel));
router.put("/hotels/:id", wrap(L.updateHotel));
router.patch("/hotels/:id/active", wrap(L.setHotelActive));
router.delete("/hotels/:id", wrap(L.deleteHotel));

// Guides
router.get("/guides", wrap(L.listGuides));
router.post("/guides", wrap(L.createGuide));
router.put("/guides/:id", wrap(L.updateGuide));
router.patch("/guides/:id/active", wrap(L.setGuideActive));
router.patch("/guides/:id/verify", wrap(L.setGuideVerified));
router.delete("/guides/:id", wrap(L.deleteGuide));

// Cars
router.get("/cars", wrap(L.listCars));
router.post("/cars", wrap(L.createCar));
router.put("/cars/:id", wrap(L.updateCar));
router.patch("/cars/:id/active", wrap(L.setCarActive));
router.delete("/cars/:id", wrap(L.deleteCar));

export default router;
