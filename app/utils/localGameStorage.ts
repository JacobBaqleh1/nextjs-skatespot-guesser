interface GameResult {
    date: string;
    spotId: string;
    distance: number;
    score: number;
    guessCoordinates: [number, number];
    correctCoordinates: [number, number]
    hasPlayed: boolean;
}

export function getTodayDate(): string {
    return new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
}

export function saveGameResult(distance: number,
     score: number,
      spotId: string,
       guessCoords: [number, number],   
    correctCoords: [number, number]
) {
    const today = getTodayDate();
    const result: GameResult = {
        date: today,
        spotId,
        distance,
        score,
        guessCoordinates: guessCoords,
        correctCoordinates: correctCoords,
        hasPlayed: true
    };
    
    localStorage.setItem('today_game_result', JSON.stringify(result));
    localStorage.setItem('last_play_date', today);
}

export function getTodayGameResult(): GameResult | null {
    const today = getTodayDate();
    const lastPlayDate = localStorage.getItem('last_play_date');
    
    // Check if they already played today
    if (lastPlayDate === today) {
        const result = localStorage.getItem('today_game_result');
        return result ? JSON.parse(result) : null;
    }
    
    return null;
}

export function hasPlayedToday(): boolean {
    const result = getTodayGameResult();
    return result !== null && result.hasPlayed;
}

export function clearTodayResult() {
    localStorage.removeItem('today_game_result');
    localStorage.removeItem('last_play_date');
}