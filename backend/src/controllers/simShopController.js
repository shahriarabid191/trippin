import fs from "fs";
import * as SimShop from "../models/simShopModel.js";
import {
    BANGLADESH_DISTRICTS,
    OPERATORS,
    OPERATOR_KEYS,
    SERVICES,
    cleanOperators,
    cleanServices,
    isValidDistrict
} from "../data/simShopReference.js";

// =====================================================================
// Public SIM / eSIM shop directory.
//
// Browsing is open to guests. Submitting a shop needs a logged-in
// account; the shop lands in the admin review queue (status = pending)
// and only shows up in the public list once an admin approves it.
// =====================================================================

// GET /api/sim-shops?district=&area=&esim=&search=
export const getShops = async (req, res) => {
    try {
        const esimRaw = req.query.esim;
        const shops = await SimShop.getPublicShops({
            district: req.query.district,
            area: req.query.area,
            esim: esimRaw === "true" ? true : esimRaw === "false" ? false : undefined,
            search: req.query.search
        });
        res.json(shops);
    } catch (error) {
        console.error("Error fetching SIM shops:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// GET /api/sim-shops/meta  — reference data for the filters + submission form
export const getMeta = async (req, res) => {
    try {
        const geography = await SimShop.getPublishedGeography();
        res.json({
            districts: BANGLADESH_DISTRICTS,
            operators: OPERATORS,
            services: SERVICES,
            geography
        });
    } catch (error) {
        console.error("Error fetching SIM shop meta:", error);
        res.status(500).json({ message: "Server error" });
    }
};

const cleanupUpload = (file) => {
    if (file?.path && fs.existsSync(file.path)) {
        try { fs.unlinkSync(file.path); } catch { /* ignore */ }
    }
};

// POST /api/sim-shops  (auth, multipart: fields + `document` PDF)
export const submitShop = async (req, res) => {
    try {
        const b = req.body;

        // Checkbox groups arrive as JSON strings or repeated fields.
        const parseList = (v) => {
            if (Array.isArray(v)) return v;
            if (typeof v === "string" && v.trim().startsWith("[")) {
                try { return JSON.parse(v); } catch { return []; }
            }
            return typeof v === "string" && v ? v.split(",").map((s) => s.trim()) : [];
        };

        const operators = cleanOperators(parseList(b.operators));
        const services = cleanServices(parseList(b.services));

        const required = ["name", "district", "area", "address", "phone", "hours"];
        const missing = required.filter((k) => !b[k] || !String(b[k]).trim());

        if (missing.length) {
            cleanupUpload(req.file);
            return res.status(400).json({ message: `Missing required fields: ${missing.join(", ")}` });
        }
        if (!isValidDistrict(b.district)) {
            cleanupUpload(req.file);
            return res.status(400).json({ message: "Unknown district" });
        }
        if (operators.length === 0) {
            cleanupUpload(req.file);
            return res.status(400).json({ message: `Select at least one operator (${OPERATOR_KEYS.join(", ")})` });
        }
        if (services.length === 0) {
            cleanupUpload(req.file);
            return res.status(400).json({ message: "Select at least one service" });
        }
        if (!req.file) {
            return res.status(400).json({ message: "A shop verification document (PDF) is required" });
        }

        const shop = await SimShop.createSubmission({
            name: String(b.name).trim().slice(0, 150),
            district: b.district,
            area: String(b.area).trim().slice(0, 120),
            address: String(b.address).trim(),
            landmark: b.landmark ? String(b.landmark).trim() : null,
            phone: String(b.phone).trim().slice(0, 40),
            altPhone: b.altPhone ? String(b.altPhone).trim().slice(0, 40) : null,
            email: b.email ? String(b.email).trim().slice(0, 150) : null,
            hours: String(b.hours).trim().slice(0, 200),
            established: b.established ? String(b.established).trim().slice(0, 10) : null,
            operators,
            services,
            esimSupport: b.esimSupport === "true" || b.esimSupport === true,
            mapLink: b.mapLink ? String(b.mapLink).trim() : null,
            docStoredName: req.file.filename,
            docFilePath: req.file.path,
            submittedBy: req.user.id
        });

        res.status(201).json({
            message: "Shop submitted for review. It will appear once an admin approves it.",
            submission: {
                id: shop.id,
                name: shop.name,
                district: shop.district,
                area: shop.area,
                status: shop.status
            }
        });
    } catch (error) {
        console.error("Error submitting SIM shop:", error);
        cleanupUpload(req.file);
        res.status(500).json({ message: "Server error" });
    }
};

// PUT /api/sim-shops/:id (auth, multipart: fields + `document` optional PDF)
export const updateShop = async (req, res) => {
    try {
        const shop = await SimShop.getShopById(req.params.id);
        if (!shop || shop.submitted_by !== req.user.id) {
            cleanupUpload(req.file);
            return res.status(404).json({ message: "Submission not found" });
        }

        const b = req.body;

        const parseList = (v) => {
            if (Array.isArray(v)) return v;
            if (typeof v === "string" && v.trim().startsWith("[")) {
                try { return JSON.parse(v); } catch { return []; }
            }
            return typeof v === "string" && v ? v.split(",").map((s) => s.trim()) : [];
        };

        const operators = cleanOperators(parseList(b.operators));
        const services = cleanServices(parseList(b.services));

        const required = ["name", "district", "area", "address", "phone", "hours"];
        const missing = required.filter((k) => !b[k] || !String(b[k]).trim());

        if (missing.length) {
            cleanupUpload(req.file);
            return res.status(400).json({ message: `Missing required fields: ${missing.join(", ")}` });
        }
        if (!isValidDistrict(b.district)) {
            cleanupUpload(req.file);
            return res.status(400).json({ message: "Unknown district" });
        }
        if (operators.length === 0) {
            cleanupUpload(req.file);
            return res.status(400).json({ message: `Select at least one operator (${OPERATOR_KEYS.join(", ")})` });
        }
        if (services.length === 0) {
            cleanupUpload(req.file);
            return res.status(400).json({ message: "Select at least one service" });
        }

        const oldFile = req.file ? shop.doc_file_path : null;

        const updatedShop = await SimShop.updateOwnSubmission(req.params.id, req.user.id, {
            name: String(b.name).trim().slice(0, 150),
            district: b.district,
            area: String(b.area).trim().slice(0, 120),
            address: String(b.address).trim(),
            landmark: b.landmark ? String(b.landmark).trim() : null,
            phone: String(b.phone).trim().slice(0, 40),
            altPhone: b.altPhone ? String(b.altPhone).trim().slice(0, 40) : null,
            email: b.email ? String(b.email).trim().slice(0, 150) : null,
            hours: String(b.hours).trim().slice(0, 200),
            established: b.established ? String(b.established).trim().slice(0, 10) : null,
            operators,
            services,
            esimSupport: b.esimSupport === "true" || b.esimSupport === true,
            mapLink: b.mapLink ? String(b.mapLink).trim() : null,
            docStoredName: req.file ? req.file.filename : null,
            docFilePath: req.file ? req.file.path : null,
        });

        if (oldFile && fs.existsSync(oldFile)) {
            try { fs.unlinkSync(oldFile); } catch { /* ignore */ }
        }

        res.json({
            message: "Shop updated successfully. It is now pending admin review.",
            submission: {
                id: updatedShop.id,
                name: updatedShop.name,
                district: updatedShop.district,
                area: updatedShop.area,
                status: updatedShop.status
            }
        });
    } catch (error) {
        console.error("Error updating SIM shop:", error);
        cleanupUpload(req.file);
        res.status(500).json({ message: "Server error" });
    }
};

// GET /api/sim-shops/mine  (auth)
export const getMySubmissions = async (req, res) => {
    try {
        const rows = await SimShop.getSubmissionsByUser(req.user.id);
        res.json(rows);
    } catch (error) {
        console.error("Error fetching submissions:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// DELETE /api/sim-shops/:id  (auth — withdraw your own submission)
export const withdrawSubmission = async (req, res) => {
    try {
        const shop = await SimShop.getShopById(req.params.id);

        if (!shop || shop.submitted_by !== req.user.id) {
            return res.status(404).json({ message: "Submission not found" });
        }

        if (shop.doc_file_path && fs.existsSync(shop.doc_file_path)) {
            try { fs.unlinkSync(shop.doc_file_path); } catch { /* ignore */ }
        }

        await SimShop.deleteOwnSubmission(req.params.id, req.user.id);
        res.json({ message: "Submission withdrawn" });
    } catch (error) {
        console.error("Error withdrawing submission:", error);
        res.status(500).json({ message: "Server error" });
    }
};
