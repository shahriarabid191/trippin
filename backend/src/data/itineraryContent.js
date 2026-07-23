// Rule-based itinerary generator: no external AI call. Every answer the
// traveler picks feeds into if/else branching that decides WHICH real
// Bangladeshi destinations appear (not just how they're described):
//   - landscape  -> which destination pool to pick from
//   - interest   -> which destinations from that pool are prioritized first
//   - duration   -> how many legs the trip has, and how many days each gets
//   - pace       -> how many activities are listed per time slot
//   - budget     -> the closing "how you eat/get around" line per leg

const PLACES = {
    Dhaka: {
        primaryInterest: "Culture & Heritage",
        summary:
            "Dive into the historical heartbeat of Bangladesh through Mughal forts, riverfront palaces, and the ever-buzzing lanes of the old city.",
        baseMorning: [
            "Visit Lalbagh Fort, a 17th-century unfinished Mughal fortress",
            "Explore Ahsan Manzil, the pink-hued palace on the Buriganga riverfront"
        ],
        baseAfternoon: [
            "Wander the narrow lanes and old merchant houses of Old Dhaka",
            "Take a rickshaw ride through Shakhari Bazar"
        ],
        interestExtra: {
            "Culture & Heritage": {
                morning: "Tour the Liberation War Museum",
                afternoon: "Browse antique brassware and jamdani shops in Old Dhaka"
            },
            "Nature & Wildlife": {
                morning: "Stroll through the National Botanical Garden in Mirpur",
                afternoon: "Visit Dhaka Zoo"
            },
            "Adventure & Outdoors": {
                morning: "Row a wooden boat across the Buriganga River",
                afternoon: "Cycle through the busy streets of Old Dhaka with a local guide"
            },
            "Food & Local Life": {
                morning: "Sample paratha and beef bhuna at an Old Dhaka breakfast stall",
                afternoon: "Join a street-food crawl through Nazira Bazar"
            }
        }
    },
    Sylhet: {
        primaryInterest: "Nature & Wildlife",
        summary:
            "Trade the city for rolling tea gardens, misty hills, and crystal-clear rivers in Bangladesh's lush northeast.",
        baseMorning: [
            "Stroll through the emerald tea gardens of Sreemangal",
            "Visit a working tea-processing factory and tasting room"
        ],
        baseAfternoon: [
            "Take a boat ride through the Ratargul freshwater swamp forest",
            "Watch the sun set over the hills from a tea-estate viewpoint"
        ],
        interestExtra: {
            "Culture & Heritage": {
                morning: "Visit the shrine of Hazrat Shah Jalal in Sylhet town",
                afternoon: "Explore a traditional Manipuri weaving village"
            },
            "Nature & Wildlife": {
                morning: "Birdwatch along the trails of Lawachara National Park",
                afternoon: "Look for gibbons and langurs in the rainforest canopy"
            },
            "Adventure & Outdoors": {
                morning: "Hike the forest trails of Lawachara National Park",
                afternoon: "Wade through the stone-and-water landscape of Jaflong"
            },
            "Food & Local Life": {
                morning: "Try the legendary seven-layer tea at a local tea stall",
                afternoon: "Share a home-style Sylheti lunch with a local family"
            }
        }
    },
    "Cox's Bazar": {
        primaryInterest: "Adventure & Outdoors",
        summary:
            "Unwind on the world's longest natural sea beach, with golden sand, fresh seafood, and a laid-back coastal pace.",
        baseMorning: [
            "Watch the sunrise over the 120km stretch of Cox's Bazar beach",
            "Walk the shoreline from Laboni Beach toward Sugandha Point"
        ],
        baseAfternoon: [
            "Cruise along the scenic Marine Drive coastal highway",
            "Relax at Inani Beach as the tide rolls in"
        ],
        interestExtra: {
            "Culture & Heritage": {
                morning: "Visit the Buddhist temple and monastery at Ramu",
                afternoon: "Browse the Burmese Market for local handicrafts"
            },
            "Nature & Wildlife": {
                morning: "Explore Himchari National Park's waterfalls and viewpoints",
                afternoon: "Spot local birdlife along the Bakkhali riverbanks"
            },
            "Adventure & Outdoors": {
                morning: "Try surfing or jet-skiing on the open beach",
                afternoon: "Take a speedboat out to Sonadia Island"
            },
            "Food & Local Life": {
                morning: "Sample fresh dried fish (shutki) at a local seaside market",
                afternoon: "Join a beachside seafood barbecue as the sun sets"
            }
        }
    },
    Bandarban: {
        primaryInterest: "Adventure & Outdoors",
        summary:
            "Climb into Bangladesh's dramatic hill tracts, where cloud-wrapped peaks, tribal villages, and jungle waterfalls await.",
        baseMorning: [
            "Hike up to the Nilgiri viewpoint for sweeping hill-tract panoramas",
            "Visit the Golden Temple (Buddha Dhatu Jadi) overlooking the town"
        ],
        baseAfternoon: [
            "Trek the ridge trail out to Chimbuk hill",
            "Cool off at the Shailapropat waterfall"
        ],
        interestExtra: {
            "Culture & Heritage": {
                morning: "Visit a Marma or Bawm tribal village to learn local traditions",
                afternoon: "Browse handwoven textiles at the Bandarban hill market"
            },
            "Nature & Wildlife": {
                morning: "Walk the forest trails around Nilgiri spotting local birdlife",
                afternoon: "Explore the jungle canopy near Chimbuk"
            },
            "Adventure & Outdoors": {
                morning: "Trek the steep trail up to Nilgiri before the clouds roll in",
                afternoon: "Go tubing through the Sangu River rapids"
            },
            "Food & Local Life": {
                morning: "Try bamboo-cooked chicken (bamboo chungi) at a hillside eatery",
                afternoon: "Share a tribal-style meal at a local homestay"
            }
        }
    },
    "Sajek Valley": {
        primaryInterest: "Nature & Wildlife",
        summary:
            "Wake up above the clouds in Bangladesh's highest hill valley, where the horizon rolls on in every direction.",
        baseMorning: [
            "Watch the sunrise over a sea of clouds from Konglak Hill",
            "Walk the ridge trail connecting Sajek's viewpoints"
        ],
        baseAfternoon: [
            "Visit a Lushai tribal village near the valley",
            "Relax at a hillside cottage as mist rolls through the valley"
        ],
        interestExtra: {
            "Culture & Heritage": {
                morning: "Learn about Lushai and Tripura hill traditions in a local village",
                afternoon: "Visit a small hilltop church built by the local community"
            },
            "Nature & Wildlife": {
                morning: "Watch the cloud sea shift over the valley at sunrise",
                afternoon: "Spot native hill birds along the ridge trail"
            },
            "Adventure & Outdoors": {
                morning: "Ride the winding jeep trail up through the hill switchbacks",
                afternoon: "Hike to Konglak Hill, Sajek's highest point"
            },
            "Food & Local Life": {
                morning: "Have a simple hill breakfast of rice and bamboo shoot curry",
                afternoon: "Try tribal-style grilled chicken at a Sajek homestay"
            }
        }
    },
    Sundarbans: {
        primaryInterest: "Nature & Wildlife",
        summary:
            "Cruise the world's largest mangrove forest by boat, home to the elusive Royal Bengal Tiger and a maze of tidal rivers.",
        baseMorning: [
            "Board a boat for a sunrise cruise through the mangrove channels",
            "Watch for spotted deer and wild boar along the riverbanks"
        ],
        baseAfternoon: [
            "Visit a forest watchtower scanning for Royal Bengal Tigers",
            "Glide past mangrove roots deep in the Sundarbans delta"
        ],
        interestExtra: {
            "Culture & Heritage": {
                morning: "Visit a riverside village and learn about local honey-collecting traditions",
                afternoon: "Hear stories of the forest from local Sundarbans guides"
            },
            "Nature & Wildlife": {
                morning: "Look for Royal Bengal Tiger tracks along the muddy banks",
                afternoon: "Spot kingfishers, eagles, and crocodiles from the boat deck"
            },
            "Adventure & Outdoors": {
                morning: "Take a smaller boat deep into the narrow tidal channels",
                afternoon: "Climb a forest watchtower for a wider view of the delta"
            },
            "Food & Local Life": {
                morning: "Share a simple river-boat breakfast of paratha and egg curry",
                afternoon: "Try fresh river fish cooked onboard by the boat crew"
            }
        }
    },
    Rangamati: {
        primaryInterest: "Culture & Heritage",
        summary:
            "Drift across the vast Kaptai Lake, framed by forested hills and the indigenous Chakma culture of the Chittagong Hill Tracts.",
        baseMorning: [
            "Cross the iconic Rangamati hanging bridge",
            "Take a boat ride across the still waters of Kaptai Lake"
        ],
        baseAfternoon: [
            "Visit a Chakma royal palace and pagoda on the lakeshore",
            "Browse handwoven textiles at a hill-tracts weaving village"
        ],
        interestExtra: {
            "Culture & Heritage": {
                morning: "Visit the Chakma Raja's palace and royal pagoda",
                afternoon: "Meet local weavers producing traditional Chakma textiles"
            },
            "Nature & Wildlife": {
                morning: "Boat past forested islands dotting Kaptai Lake",
                afternoon: "Look for hillside birdlife around the lake's quiet coves"
            },
            "Adventure & Outdoors": {
                morning: "Kayak across a quiet arm of Kaptai Lake",
                afternoon: "Hike up to a hilltop viewpoint over the lake"
            },
            "Food & Local Life": {
                morning: "Try fresh lake fish grilled at a lakeside stall",
                afternoon: "Sample bamboo-cooked hill-tracts specialties"
            }
        }
    },
    Comilla: {
        primaryInterest: "Culture & Heritage",
        summary:
            "Step into ancient Bengal at ruined Buddhist monasteries and quiet countryside far from the city rush.",
        baseMorning: [
            "Explore the 7th-century ruins of the Mainamati Buddhist monastery",
            "Visit the Shalban Vihara archaeological site"
        ],
        baseAfternoon: [
            "Walk the peaceful grounds of the Comilla War Cemetery",
            "Wander the countryside villages surrounding Mainamati"
        ],
        interestExtra: {
            "Culture & Heritage": {
                morning: "Study the ancient terracotta plaques at the Mainamati Museum",
                afternoon: "Visit the Shalban Vihara ruins, once one of the region's largest monasteries"
            },
            "Nature & Wildlife": {
                morning: "Walk the green, tree-lined ridges surrounding Mainamati",
                afternoon: "Explore the ponds and farmland of the surrounding countryside"
            },
            "Adventure & Outdoors": {
                morning: "Cycle the quiet rural roads between Mainamati's ruin sites",
                afternoon: "Explore the countryside on foot away from the main tourist path"
            },
            "Food & Local Life": {
                morning: "Try Comilla's famous roshomalai at a local sweet shop",
                afternoon: "Share a home-style rural Bengali lunch with a village family"
            }
        }
    }
};

// Which destinations are even in play depends on the landscape the
// traveler picked. Order matters: it's the tie-break order before interest
// re-prioritizes the list.
const LANDSCAPE_CANDIDATES = {
    "Hills & Mountains": ["Bandarban", "Sajek Valley", "Rangamati", "Sylhet"],
    "Rivers & Waterways": ["Sundarbans", "Cox's Bazar", "Rangamati", "Sylhet"],
    "Plains & Countryside": ["Dhaka", "Comilla", "Sylhet", "Rangamati"]
};

const DEFAULT_LANDSCAPE = "Plains & Countryside";

const LEG_COUNT_BY_DURATION = {
    "1–3 days": 1,
    "4–7 days": 2,
    "8–15 days": 3,
    "15+ days": 4
};

const TOTAL_DAYS_BY_DURATION = {
    "1–3 days": 3,
    "4–7 days": 6,
    "8–15 days": 12,
    "15+ days": 18
};

const DEFAULT_LEG_COUNT = 2;
const DEFAULT_TOTAL_DAYS = 6;

const MORNING_TIME = "06:00 - 09:00";
const AFTERNOON_TIME = "15:00 - 17:00";

const BUDGET_MORNING_EXTRA = {
    "Budget-Friendly": "Grab a quick roadside breakfast before an early start",
    "Mid-Range": "Enjoy a relaxed breakfast at your guesthouse before heading out",
    "Luxury": "Start with a full breakfast spread at your hotel before departing"
};

const BUDGET_AFTERNOON_EXTRA = {
    "Budget-Friendly": "Keep costs down with local buses, CNGs, and street-food meals",
    "Mid-Range": "Get around by CNG or private car and eat at casual local restaurants",
    "Luxury": "Travel by private car and dine at upscale restaurants or resorts"
};

// Picks which destinations appear, in what order: start from the
// landscape's candidate list, then bubble up whichever ones best match the
// traveler's stated interest.
const selectPlaces = (landscape, interest, legCount) => {
    let candidates;

    if (landscape === "Hills & Mountains") {
        candidates = LANDSCAPE_CANDIDATES["Hills & Mountains"];
    } else if (landscape === "Rivers & Waterways") {
        candidates = LANDSCAPE_CANDIDATES["Rivers & Waterways"];
    } else if (landscape === "Plains & Countryside") {
        candidates = LANDSCAPE_CANDIDATES["Plains & Countryside"];
    } else {
        candidates = LANDSCAPE_CANDIDATES[DEFAULT_LANDSCAPE];
    }

    const matching = [];
    const rest = [];

    for (const place of candidates) {
        if (PLACES[place].primaryInterest === interest) {
            matching.push(place);
        } else {
            rest.push(place);
        }
    }

    return [...matching, ...rest].slice(0, legCount);
};

// Splits the trip's total days as evenly as possible across each leg,
// front-loading any remainder, and labels each chunk "Day X" / "Day X-Y".
const buildDayRanges = (totalDays, legCount) => {
    const base = Math.floor(totalDays / legCount);
    const remainder = totalDays % legCount;

    const ranges = [];
    let start = 1;

    for (let i = 0; i < legCount; i++) {
        const size = base + (i < remainder ? 1 : 0);
        const end = start + size - 1;

        ranges.push(size <= 1 ? `Day ${start}` : `Day ${start}-${end}`);
        start = end + 1;
    }

    return ranges;
};

const buildLeg = (placeName, dayRange, answers) => {
    const place = PLACES[placeName];

    let itemCount;

    if (answers.pace === "Relaxed") {
        itemCount = 2;
    } else if (answers.pace === "Packed") {
        itemCount = 4;
    } else {
        itemCount = 3;
    }

    const interest = place.interestExtra[answers.interest];

    const morningPool = [...place.baseMorning];
    if (interest) morningPool.push(interest.morning);
    morningPool.push(BUDGET_MORNING_EXTRA[answers.budget] || BUDGET_MORNING_EXTRA["Mid-Range"]);

    const afternoonPool = [...place.baseAfternoon];
    if (interest) afternoonPool.push(interest.afternoon);
    afternoonPool.push(BUDGET_AFTERNOON_EXTRA[answers.budget] || BUDGET_AFTERNOON_EXTRA["Mid-Range"]);

    return {
        place: placeName,
        dayRange,
        summary: place.summary,
        morning: {
            time: MORNING_TIME,
            items: morningPool.slice(0, itemCount)
        },
        afternoon: {
            time: AFTERNOON_TIME,
            items: afternoonPool.slice(0, itemCount)
        }
    };
};

export const buildItinerary = (answers) => {
    const legCount = LEG_COUNT_BY_DURATION[answers.duration] || DEFAULT_LEG_COUNT;
    const totalDays = TOTAL_DAYS_BY_DURATION[answers.duration] || DEFAULT_TOTAL_DAYS;

    const places = selectPlaces(answers.landscape, answers.interest, legCount);
    const dayRanges = buildDayRanges(totalDays, legCount);

    return {
        durationLabel: answers.duration,
        legs: places.map((place, index) => buildLeg(place, dayRanges[index], answers))
    };
};
