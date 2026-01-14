export const normalize = (val, max) => Math.min(100, Math.max(0, (val / max) * 100));

export const getCaps = (lvl) => {
    switch (lvl) {
        case 'advanced': return { squat: 75, pushup: 60, plank: 180, burpee: 60, vo2: 65, stork: 60, hops: 60, tapping: 40 };
        case 'adapted': return { squat: 30, pushup: 15, plank: 60, burpee: 20, vo2: 35, stork: 30, hops: 30, tapping: 20 };
        default: return { squat: 50, pushup: 40, plank: 120, burpee: 40, vo2: 50, stork: 45, hops: 45, tapping: 30 }; // Intermediate / General
    }
};

export const calcScore = (val, max) => normalize(val || 0, max);

export const calculateMetrics = (results, userLevel = 'general') => {
    const caps = getCaps(userLevel);

    // 1. Strength (Squats + Pushups + Plank)
    // Pushups: 35%, Squats: 35%, Plank: 30%
    const strengthRaw =
        (calcScore(results.strength?.pushup?.reps, caps.pushup) * 0.35) +
        (calcScore(results.strength?.squat?.reps, caps.squat) * 0.35) +
        (calcScore(results.strength?.plank?.time, caps.plank) * 0.30);

    // 2. Energy (Burpees + Rockport/Step/Cooper)
    // Burpees: 60%, Aerobic: 40%
    let aerobicScore = 0;
    if (results.cardio?.rockport?.vo2Max) aerobicScore = normalize(results.cardio.rockport.vo2Max, caps.vo2);
    else if (results.cardio?.cooper?.vo2Max) aerobicScore = normalize(results.cardio.cooper.vo2Max, caps.vo2);
    else if (results.cardio?.vo2) aerobicScore = normalize(results.cardio.vo2, caps.vo2); // Generic/Fallback
    else if (results.cardio?.ruffier) aerobicScore = normalize(Math.max(0, 20 - results.cardio.ruffier.score), 20);

    const energyRaw = (calcScore(results.cardio?.burpee?.reps || results.cardio?.burpees, caps.burpee) * 0.60) + (aerobicScore * 0.40);

    // 3. Body (Composition)
    // Completion based or BMI health
    const bodyRaw = results.composition?.bmi ? 100 : 0;

    // 4. Control (Agility + Coordination + Balance)
    // Tapping: 33%, Stork: 33%, Hops: 33%
    const tappingScore = calcScore(results.agility?.tapping?.count || results.agility?.tapping, caps.tapping);
    const storkVal = results.agility?.blindStork?.time || results.agility?.stork?.bestTime || results.agility?.stork || 0;
    const storkScore = calcScore(storkVal, caps.stork);
    const hopsScore = calcScore(results.agility?.hops?.count || results.agility?.hops, caps.hops);

    const controlRaw = (tappingScore + storkScore + hopsScore) / 3;

    // 5. Mobility (Shoulder + Overhead Squat)
    // Shoulder: 60%, Overhead Squat: 40%
    const shoulderGap = results.mobility?.shoulder?.gap ?? 50;
    const shoulderScore = Math.max(0, Math.min(100, 100 - (shoulderGap * 2)));
    const ohsScore = calcScore(results.mobility?.overheadSquat?.score, 3);
    const mobilityRaw = (shoulderScore * 0.6) + (ohsScore * 0.4);

    return {
        strength: Math.round(strengthRaw),
        energy: Math.round(energyRaw),
        body: Math.round(bodyRaw),
        control: Math.round(controlRaw),
        mobility: Math.round(mobilityRaw)
    };
};

export const calculateGlobalScore = (metrics) => {
    const values = Object.values(metrics);
    const sum = values.reduce((acc, val) => acc + val, 0);
    return Math.round(sum / values.length);
};
