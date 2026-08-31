import express from "express";

import { wrap } from "../../utils/adminQuery.js";
import {
    listPhotos,
    flagPhoto,
    unflagPhoto,
    unpublishPhoto,
    republishPhoto,
    deletePhoto,
    listComments,
    deleteComment,
    listReviews,
    flagReview,
    unflagReview,
    deleteReview,
    listJournals,
    unpublishJournal,
    republishJournal,
    deleteJournal
} from "../../controllers/admin/moderationController.js";


const router = express.Router();


/* -------------------------- Gallery photos -------------------------- */

// GET /api/admin/moderation/gallery
router.get(
    "/gallery",
    wrap(listPhotos)
);


// PATCH /api/admin/moderation/gallery/:id/flag
router.patch(
    "/gallery/:id/flag",
    wrap(flagPhoto)
);


// PATCH /api/admin/moderation/gallery/:id/unflag
router.patch(
    "/gallery/:id/unflag",
    wrap(unflagPhoto)
);


// PATCH /api/admin/moderation/gallery/:id/unpublish
router.patch(
    "/gallery/:id/unpublish",
    wrap(unpublishPhoto)
);


// PATCH /api/admin/moderation/gallery/:id/republish
router.patch(
    "/gallery/:id/republish",
    wrap(republishPhoto)
);


// DELETE /api/admin/moderation/gallery/:id
router.delete(
    "/gallery/:id",
    wrap(deletePhoto)
);


/* -------------------------- Photo comments -------------------------- */

// GET /api/admin/moderation/comments
router.get(
    "/comments",
    wrap(listComments)
);


// DELETE /api/admin/moderation/comments/:id
router.delete(
    "/comments/:id",
    wrap(deleteComment)
);


/* ------------------------------ Reviews ----------------------------- */
/* :type = hotel | guide | car */

// GET /api/admin/moderation/reviews
router.get(
    "/reviews",
    wrap(listReviews)
);


// PATCH /api/admin/moderation/reviews/:type/:id/flag
router.patch(
    "/reviews/:type/:id/flag",
    wrap(flagReview)
);


// PATCH /api/admin/moderation/reviews/:type/:id/unflag
router.patch(
    "/reviews/:type/:id/unflag",
    wrap(unflagReview)
);


// DELETE /api/admin/moderation/reviews/:type/:id
router.delete(
    "/reviews/:type/:id",
    wrap(deleteReview)
);


/* ----------------------- Public journal entries -------------------- */

// GET /api/admin/moderation/journals
router.get(
    "/journals",
    wrap(listJournals)
);


// PATCH /api/admin/moderation/journals/:id/unpublish
router.patch(
    "/journals/:id/unpublish",
    wrap(unpublishJournal)
);


// PATCH /api/admin/moderation/journals/:id/republish
router.patch(
    "/journals/:id/republish",
    wrap(republishJournal)
);


// DELETE /api/admin/moderation/journals/:id
router.delete(
    "/journals/:id",
    wrap(deleteJournal)
);


export default router;
