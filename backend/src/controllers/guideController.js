import * as Guide from "../models/guideModel.js";
import * as GuideBooking from "../models/guideBookingModel.js";


// GET /api/guides  (public browse list)

export const getGuides = async (req, res) => {

    try {

        const guides = await Guide.getAllGuides();

        res.json(guides);

    }
    catch (error) {

        res.status(500).json({
            message: "Server error"
        });

    }

};



// GET /api/guides/:id

export const getGuide = async (req, res) => {

    try {

        const guide = await Guide.getGuideById(req.params.id);

        if (!guide) {
            return res.status(404).json({
                message: "Guide not found"
            });
        }

        res.json(guide);

    }
    catch (error) {

        res.status(500).json({
            message: "Server error"
        });

    }

};



// POST /api/guides  (admin only)

export const createGuide = async (req, res) => {

    const guide = await Guide.addGuide({
        name: req.body.name,
        bio: req.body.bio,
        location: req.body.location,
        pricePerDay: req.body.pricePerDay,
        photoUrl: req.body.photoUrl,
        createdBy: req.user.id
    });

    res.status(201)
        .json({
            message: "Guide created",
            guide
        });

};



// PUT /api/guides/:id  (admin only)

export const editGuide = async (req, res) => {

    const updated =
        await Guide.updateGuide(
            req.params.id,
            req.body
        );


    if (updated === 0) {
        return res.status(404)
            .json({
                message: "Guide not found"
            });
    }


    res.json({
        message: "Updated successfully"
    });

};



// DELETE /api/guides/:id  (admin only)

export const removeGuide = async (req, res) => {

    const deleted =
        await Guide.deleteGuide(
            req.params.id
        );


    if (deleted === 0) {
        return res.status(404)
            .json({
                message: "Guide not found"
            });
    }


    res.json({
        message: "Deleted successfully"
    });

};



// GET /api/guides/bookings/mine

export const getMyBookings = async (req, res) => {

    try {

        const bookings = await GuideBooking.getBookingsByUserID(req.user.id);

        res.json(bookings);

    }
    catch (error) {

        res.status(500).json({
            message: "Server error"
        });

    }

};



// POST /api/guides/:id/book

export const bookGuide = async (req, res) => {

    const booking = await GuideBooking.addBooking({
        guideID: req.params.id,
        userID: req.user.id,
        bookingDate: req.body.bookingDate,
        notes: req.body.notes
    });

    res.status(201)
        .json({
            message: "Guide booked",
            booking
        });

};



// DELETE /api/guides/bookings/:bookingId

export const cancelBooking = async (req, res) => {

    const deleted =
        await GuideBooking.deleteBooking(
            req.params.bookingId,
            req.user.id
        );


    if (deleted === 0) {
        return res.status(404)
            .json({
                message: "Booking not found"
            });
    }


    res.json({
        message: "Booking cancelled"
    });

}; 