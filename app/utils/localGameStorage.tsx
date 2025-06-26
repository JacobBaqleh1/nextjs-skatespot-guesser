const SCORE_KEY = "geoguessr_last_score";
const TIME_KEY = "geoguessr_last_played";

export function saveGameResult(miles: number) {
    if (typeof window !== "undefined") {
        localStorage.setItem(SCORE_KEY, miles.toString());
        localStorage.setItem(TIME_KEY, Date.now().toString());
    }
}

export function getLastScore(): number | null {
    if (typeof window === "undefined") return null;
    const val = localStorage.getItem(SCORE_KEY);
    return val ? parseInt(val, 10) : null;
}

export function getLastPlayed(): number | null {
    if (typeof window === "undefined") return null;
    const val = localStorage.getItem(TIME_KEY);
    return val ? parseInt(val, 10) : null;
}