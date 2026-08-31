// =====================================================================
// Reference data for the SIM / eSIM shop directory.
//
// Single source of truth for the district list, operator keys and the
// service checklist. Served to the frontend via GET /api/sim-shops/meta
// so the public page and the admin editor never drift apart.
// (Kept in sync with the original frontend/src/data/simShopsData.js.)
// =====================================================================

export const BANGLADESH_DISTRICTS = [
    "Bagerhat", "Bandarban", "Barguna", "Barisal", "Bhola",
    "Bogura", "Brahmanbaria", "Chandpur", "Chattogram", "Chuadanga",
    "Cox's Bazar", "Cumilla", "Dhaka", "Dinajpur", "Faridpur",
    "Feni", "Gaibandha", "Gazipur", "Gopalganj", "Habiganj",
    "Jamalpur", "Jessore (Jashore)", "Jhalokati", "Jhenaidah", "Joypurhat",
    "Khagrachhari", "Khulna", "Kishoreganj", "Kurigram", "Kushtia",
    "Lakshmipur", "Lalmonirhat", "Madaripur", "Magura", "Manikganj",
    "Meherpur", "Moulvibazar", "Munshiganj", "Mymensingh", "Naogaon",
    "Narail", "Narayanganj", "Narsingdi", "Natore", "Netrokona",
    "Nilphamari", "Noakhali", "Pabna", "Panchagarh", "Patuakhali",
    "Pirojpur", "Rajbari", "Rajshahi", "Rangamati", "Rangpur",
    "Satkhira", "Shariatpur", "Sherpur", "Sirajganj", "Sunamganj",
    "Sylhet", "Tangail", "Thakurgaon"
];

export const OPERATORS = {
    grameenphone: { name: "Grameenphone (GP)", color: "#00a651" },
    robi:         { name: "Robi",              color: "#e2001a" },
    banglalink:   { name: "Banglalink",        color: "#f7941d" },
    teletalk:     { name: "Teletalk",          color: "#1a5276" },
    airtel:       { name: "Airtel (Robi)",     color: "#ef3e42" }
};

export const OPERATOR_KEYS = Object.keys(OPERATORS);

export const SERVICES = [
    "New SIM", "eSIM Activation", "Biometric Registration", "SIM Replacement",
    "Number Transfer (MNP)", "Data Plans", "Recharge", "Postpaid Plans",
    "Corporate Plans", "International Roaming", "Bill Payment", "Handset Sales"
];

export const SHOP_STATUSES = ["pending", "approved", "rejected"];

// Keep only recognised operator keys, de-duplicated.
export const cleanOperators = (arr) =>
    Array.isArray(arr) ? [...new Set(arr.filter((k) => OPERATOR_KEYS.includes(k)))] : [];

// Free-text services, trimmed and de-duplicated, capped for sanity.
export const cleanServices = (arr) =>
    Array.isArray(arr)
        ? [...new Set(arr.map((s) => String(s).trim()).filter(Boolean))].slice(0, 30)
        : [];

export const isValidDistrict = (d) => BANGLADESH_DISTRICTS.includes(d);
