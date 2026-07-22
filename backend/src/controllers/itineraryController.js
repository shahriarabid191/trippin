import * as Itinerary from "../models/itineraryModel.js";
import { buildItinerary } from "../data/itineraryContent.js";

const REQUIRED_ANSWER_KEYS = ["duration", "landscape", "interest", "pace", "budget"];

const isValidAnswers = (answers) =>
    answers &&
    typeof answers === "object" &&
    REQUIRED_ANSWER_KEYS.every(
        (key) => typeof answers[key] === "string" && answers[key].trim()
    );

// POST /api/itinerary/generate
export const generateItinerary = async (req, res) => {

    const { answers } = req.body;

    if (!isValidAnswers(answers)) {
        return res.status(400).json({
            message: "All questionnaire answers are required"
        });
    }

    try {

        const content = buildItinerary(answers);

        if (req.user) {
            await Itinerary.upsertDraft(req.user.id, answers, content);
        }

        res.json({ answers, content });

    } catch (error) {

        console.error("Itinerary generation error:", error);
        res.status(500).json({
            message: "Server error"
        });

    }

};

// GET /api/itinerary/draft
export const getDraft = async (req, res) => {

    try {

        const draft = await Itinerary.getDraftByUserID(req.user.id);

        if (!draft) {
            return res.json({ draft: null });
        }

        res.json({
            draft: {
                answers: draft.answers,
                content: draft.content
            }
        });

    } catch (error) {

        console.error("Get draft error:", error);
        res.status(500).json({
            message: "Server error"
        });

    }

};

// DELETE /api/itinerary/draft
export const discardDraft = async (req, res) => {

    try {

        await Itinerary.deleteDraft(req.user.id);

        res.json({
            message: "Draft discarded"
        });

    } catch (error) {

        console.error("Discard draft error:", error);
        res.status(500).json({
            message: "Server error"
        });

    }

};
