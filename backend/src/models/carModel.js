import db from "../config/db.js";

// Get all cars (public browse list)
export const getAllCars = async () => {
    const result = await db.query(
        "SELECT * FROM cars ORDER BY created_at DESC"
    );
    return result.rows;
};

// Get a single car
export const getCarById = async (id) => {
    const result = await db.query(
        "SELECT * FROM cars WHERE id=$1",
        [id]
    );
    return result.rows[0];
};

// Add a car
export const addCar = async (car) => {
    const result = await db.query(
        `
        INSERT INTO cars(name, type, location, price_per_day, photo_url, created_by)
        VALUES($1,$2,$3,$4,$5,$6)
        RETURNING *
        `,
        [car.name, car.type, car.location, car.pricePerDay, car.photoUrl, car.createdBy]
    );
    return result.rows[0];
};

// Update a car
export const updateCar = async (id, car) => {
    const result = await db.query(
        `
        UPDATE cars
        SET name=$1, type=$2, location=$3, price_per_day=$4, photo_url=$5
        WHERE id=$6
        `,
        [car.name, car.type, car.location, car.pricePerDay, car.photoUrl, id]
    );
    return result.rowCount;
};

// Delete a car
export const deleteCar = async (id) => {
    const result = await db.query(
        "DELETE FROM cars WHERE id=$1",
        [id]
    );
    return result.rowCount;
}; 