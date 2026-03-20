import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Task from "../models/task.models.js";
import { User } from "../models/user.models.js";

export const generateWeeklyInsight = asyncHandler(async (req, res) => {
    const user = req.user;
    if (!user) throw new ApiError(401, "Unauthorized");

    const now = new Date();
    // Check if generatedAt is older than 7 days
    if (user.weeklyInsight && user.weeklyInsight.generatedAt) {
        const daysDiff = (now - new Date(user.weeklyInsight.generatedAt)) / (1000 * 60 * 60 * 24);
        if (daysDiff < 7 && user.weeklyInsight.content) {
            // Return existing
            return res.status(200).json(new ApiResponse(200, user.weeklyInsight, "Returned last saved insight"));
        }
    }

    // Otherwise, generate new insight
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Fetch tasks updated in last 7 days for the user
    const tasks = await Task.find({
        user: user._id,
        updatedAt: { $gte: sevenDaysAgo }
    });

    let forgedCount = 0;
    let otherCount = 0;
    const hourCounts = {};
    const dayCounts = {};

    tasks.forEach(t => {
        if (t.status === "forged") {
            forgedCount++;
            if (t.forgedAt) {
                const date = new Date(t.forgedAt);
                const day = date.getDay(); // 0-6
                const hour = date.getHours(); // 0-23
                
                dayCounts[day] = (dayCounts[day] || 0) + 1;
                hourCounts[hour] = (hourCounts[hour] || 0) + 1;
            }
        } else {
            otherCount++;
        }
    });

    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    let mostProdDay = "Unknown";
    let mostProdHour = "Unknown";

    if (Object.keys(dayCounts).length > 0) {
        let maxDay = Object.keys(dayCounts).reduce((a, b) => dayCounts[a] > dayCounts[b] ? a : b);
        mostProdDay = daysOfWeek[maxDay];
    }
    if (Object.keys(hourCounts).length > 0) {
        let maxHour = Object.keys(hourCounts).reduce((a, b) => hourCounts[a] > hourCounts[b] ? a : b);
        // Convert to readable format like "9:00 AM"
        const hourInt = parseInt(maxHour);
        const suffix = hourInt >= 12 ? 'PM' : 'AM';
        const displayHour = hourInt % 12 === 0 ? 12 : hourInt % 12;
        mostProdHour = `${displayHour}:00 ${suffix}`;
    }

    const rawStats = {
        mostProductiveDay: mostProdDay,
        mostProductiveHour: mostProdHour,
        forgedCount,
        uncompletedCount: otherCount,
        period: "Last 7 Days"
    };

    // Call Gemini
    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
        throw new ApiError(500, "Gemini API key not configured in .env");
    }

    const systemPrompt = `You are 'The Forge Oracle', a legendary master blacksmith and productivity coach. Analyze the provided JSON task data. Your goal is to provide a 3-sentence review:
The Pattern: Identify their most productive habit (e.g., 'Your hammer strikes hardest on Tuesday mornings').
The Critique: Identify a weakness or a category they are avoiding.
The Prophecy: Give one high-energy motivational command for the week ahead.
Tone: Stoic, Epic, and Data-Driven. Avoid 'AI-sounding' fluff. Do not wrap output in markdown code blocks. Just plain text formatting with line breaks.`;

    const userPrompt = `Task History Data: ${JSON.stringify(rawStats)}`;

    let generatedContent = "The Forge Oracle cannot see your destiny. Return to the anvil and forge ahead.";

    try {
        const fetchRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                system_instruction: {
                    parts: [{ text: systemPrompt }]
                },
                contents: [{
                    parts: [{ text: userPrompt }]
                }]
            })
        });

        const data = await fetchRes.json();
        if (data.candidates && data.candidates[0].content.parts[0].text) {
            generatedContent = data.candidates[0].content.parts[0].text;
        } else {
            console.error("Unexpected Gemini response:", data);
        }
    } catch (e) {
        console.error("Gemini Api error: ", e);
    }

    const insight = {
        content: generatedContent.trim(),
        generatedAt: new Date(),
        rawStats
    };

    user.weeklyInsight = insight;
    await user.save();

    return res.status(200).json(new ApiResponse(200, insight, "New insight forged"));
});
