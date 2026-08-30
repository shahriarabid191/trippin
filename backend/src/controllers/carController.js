import * as Car from "../models/carModel.js";
import * as CarBooking from "../models/carBookingModel.js";
import * as CarReview from "../models/carReviewModel.js";



// GET /api/cars

export const getCars = async (req, res) => {

    try {

        const cars = await Car.getAllCars();

        res.json(cars);

    }
    catch (error) {

        res.status(500).json({
            message: "Server error"
        });

    }

};



// GET /api/cars/:id

export const getCar = async (req, res) => {

    try {

        const car = await Car.getCarById(req.params.id);

        if (!car) {
            return res.status(404).json({
                message: "Car not found"
            });
        }

        res.json(car);

    }
    catch (error) {

        res.status(500).json({
            message: "Server error"
        });

    }

};



// POST /api/cars  (admin only)

export const createCar = async (req, res) => {

    const car = await Car.addCar({
        name: req.body.name,
        type: req.body.type,
        location: req.body.location,
        pricePerDay: req.body.pricePerDay,
        photoUrl: req.body.photoUrl,
        createdBy: req.user.id
    });

    res.status(201)
        .json({
            message: "Car created",
            car
        });

};



// PUT /api/cars/:id  (admin only)

export const editCar = async (req, res) => {

    const updated =
        await Car.updateCar(
            req.params.id,
            req.body
        );


    if (updated === 0) {
        return res.status(404)
            .json({
                message: "Car not found"
            });
    }


    res.json({
        message: "Updated successfully"
    });

};



// DELETE /api/cars/:id  (admin only)

export const removeCar = async (req, res) => {

    const deleted =
        await Car.deleteCar(
            req.params.id
        );


    if (deleted === 0) {
        return res.status(404)
            .json({
                message: "Car not found"
            });
    }


    res.json({
        message: "Deleted successfully"
    });

};



// GET /api/cars/bookings/mine

export const getMyBookings = async (req, res) => {

    try {

        const bookings = await CarBooking.getBookingsByUserID(req.user.id);

        res.json(bookings);

    }
    catch (error) {

        res.status(500).json({
            message: "Server error"
        });

    }

};



// POST /api/cars/:id/book

export const bookCar = async (req, res) => {

    if (new Date(req.body.endDate) < new Date(req.body.startDate)) {
        return res.status(400).json({
            message: "End date cannot be before start date"
        });
    }


    const booking = await CarBooking.addBooking({
        carID: req.params.id,
        userID: req.user.id,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        notes: req.body.notes
    });

    res.status(201)
        .json({
            message: "Car booked",
            booking
        });

};



// DELETE /api/cars/bookings/:bookingId

export const cancelBooking = async (req, res) => {

    const deleted =
        await CarBooking.deleteBooking(
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


// GET /api/cars/:id/reviews

export const getCarReviews = async (req, res) => {

    try {

        const reviews = await CarReview.getReviewsByCarID(req.params.id);

        const summary = await CarReview.getRatingSummary(req.params.id);

        res.json({
            reviews,
            avgRating: summary.avg_rating,
            reviewCount: summary.review_count
        });

    }
    catch (error) {

        res.status(500).json({
            message: "Server error"
        });

    }

};



// GET /api/cars/ratings/all  (for browse list)

export const getAllCarRatings = async (req, res) => {

    try {

        const summaries = await CarReview.getAllRatingSummaries();

        res.json(summaries);

    }
    catch (error) {

        res.status(500).json({
            message: "Server error"
        });

    }

};



// POST /api/cars/:id/reviews

export const createCarReview = async (req, res) => {

    try {

        const review = await CarReview.addReview({
            carID: req.params.id,
            userID: req.user.id,
            rating: req.body.rating,
            comment: req.body.comment
        });

        res.status(201)
            .json({
                message: "Review submitted",
                review
            });

    }
    catch (error) {

        if (error.code === '23505') {
            return res.status(400).json({
                message: "You already reviewed this car"
            });
        }

        res.status(500).json({
            message: "Server error"
        });

    }

};



// DELETE /api/cars/reviews/:reviewId

export const removeCarReview = async (req, res) => {

    const deleted =
        await CarReview.deleteReview(
            req.params.reviewId,
            req.user.id
        );


    if (deleted === 0) {
        return res.status(404)
            .json({
                message: "Review not found"
            });
    }


    res.json({
        message: "Deleted successfully"
    });

}; 