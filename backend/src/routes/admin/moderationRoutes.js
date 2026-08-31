import express from "express";
import { wrap } from "../../utils/adminQuery.js";
import * as M from "../../controllers/admin/moderationController.js";

const router = express.Router();

// Gallery photos
router.get("/gallery", wrap(M.listPhotos));
router.patch("/gallery/:id/flag", wrap(M.flagPhoto));
router.patch("/gallery/:id/unflag", wrap(M.unflagPhoto));
router.patch("/gallery/:id/unpublish", wrap(M.unpublishPhoto));
router.patch("/gallery/:id/republish", wrap(M.republishPhoto));
router.delete("/gallery/:id", wrap(M.deletePhoto));

// Photo comments
router.get("/comments", wrap(M.listComments));
router.delete("/comments/:id", wrap(M.deleteComment));

// Reviews (type = hotel | guide | car)
router.get("/reviews", wrap(M.listReviews));
router.patch("/reviews/:type/:id/flag", wrap(M.flagReview));
router.patch("/reviews/:type/:id/unflag", wrap(M.unflagReview));
router.delete("/reviews/:type/:id", wrap(M.deleteReview));

// Public journal entries
router.get("/journals", wrap(M.listJournals));
router.patch("/journals/:id/unpublish", wrap(M.unpublishJournal));
router.patch("/journals/:id/republish", wrap(M.republishJournal));
router.delete("/journals/:id", wrap(M.deleteJournal));

export default router;
