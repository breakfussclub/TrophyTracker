import { 
  exchangeNpssoForCode, 
  exchangeCodeForAccessToken,
  getUserTitles,
  getUserTrophiesEarnedForTitle 
} from 'psn-api';

let authorizationCache = null;

export async function authenticatePSN(npsso) {
  try {
    const accessCode = await exchangeNpssoForCode(npsso);
    const authorization = await exchangeCodeForAccessToken(accessCode);
    authorizationCache = authorization;
    return authorization;
  } catch (error) {
    console.error('PSN Authentication failed:', error.message);
    throw error;
  }
}

export async function getPSNTrophies(psnId, authorization = authorizationCache) {
  if (!authorization) {
    throw new Error('PSN not authenticated. Please set NPSSO token.');
  }

  try {
    const { trophyTitles } = await getUserTitles(
      { accessToken: authorization.accessToken },
      psnId
    );

    const trophyMap = {};
    
    for (const title of trophyTitles) {
      if (!title.npCommunicationId) continue;
      
      const gameId = title.npCommunicationId;
      const gameName = title.trophyTitleName;
      
      try {
        const earnedTrophies = await getUserTrophiesEarnedForTitle(
          { accessToken: authorization.accessToken },
          psnId,
          gameId,
          'all'
        );

        if (earnedTrophies && earnedTrophies.trophies) {
          earnedTrophies.trophies.forEach(trophy => {
            if (trophy.earned) {
              const trophyId = `${gameId}_${trophy.trophyId}`;
              trophyMap[trophyId] = {
                gameId,
                gameName,
                trophyName: trophy.trophyName,
                trophyDetail: trophy.trophyDetail,
                trophyType: trophy.trophyType,
                earnedDateTime: trophy.earnedDateTime,
                trophyId: trophy.trophyId
              };
            }
          });
        }
      } catch (err) {
        console.error(`Failed to fetch trophies for ${gameName}:`, err.message);
      }
    }

    return trophyMap;
  } catch (error) {
    console.error('Failed to fetch PSN trophies:', error.message);
    throw error;
  }
}

export function getNewTrophies(oldTrophies, newTrophies) {
  const newAchievements = [];
  
  for (const [trophyId, trophy] of Object.entries(newTrophies)) {
    if (!oldTrophies[trophyId]) {
      newAchievements.push(trophy);
    }
  }
  
  return newAchievements;
}
