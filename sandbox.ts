import { DynamicLoader } from 'bcdice';
import Result from 'bcdice/ts/result';

const loader = new DynamicLoader();

const roll = async (text: string, gameType: string): Promise<Result | null> => {
    const gameSystemInfo = loader.listAvailableGameSystems().find(info => info.id === gameType);
    if (gameSystemInfo == null) {
        return null;
    }
    const gameSystem = await loader.dynamicLoad(gameSystemInfo.id);
    return gameSystem.eval(text);
};

// roll('k20+12 角', 'SwordWorld2.5').then(t => {
//     if (t == null) {
//         console.log(null);
//         return;
//     }
//     console.log(JSON.stringify(t));
// });

roll(' 1d100', 'DiceBot').then(t => {
    if (t == null) {
        console.log(null);
        return;
    }
    console.log(JSON.stringify(t));
});