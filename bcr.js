const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

const HISTORY_API = "https://bcf-ayt4.onrender.com/sexy/all";
const PREDICT_API = "https://baccarat-g1cb.onrender.com/dudoan/supervip";

async function getData() {
    const [historyRes, predictRes] = await Promise.all([
        fetch(HISTORY_API),
        fetch(PREDICT_API)
    ]);

    const history = await historyRes.json();
    const predict = await predictRes.json();

    const predictMap = {};

    if (predict.success && Array.isArray(predict.data)) {
        for (const item of predict.data) {
            predictMap[item.table] = item;
        }
    }

    const result = [];

    for (const row of history) {

        const p = predictMap[row.ban];

        if (!p) continue;

        const historyString = row.ket_qua || "";

        result.push({
            ban: row.ban,
            phien: row.phien - 1,
            ket_qua_van_truoc: historyString.length
                ? historyString[historyString.length - 1]
                : "",
            ket_qua: historyString,
            phien_hien_tai: row.phien,
            du_doan:
                p.prediction === "P"
                    ? "Player"
                    : p.prediction === "B"
                    ? "Banker"
                    : "Tie",
            do_tin_cay: `${p.confidence}%`
        });
    }

    result.sort((a, b) => Number(a.ban) - Number(b.ban));

    return result;
}

app.get("/", async (req, res) => {
    try {
        const data = await getData();
        res.json(data);
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});