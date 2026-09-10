import { getApplicantRecommendations } from './recommendation.service.js';

export function createGetRecommendationsHandler({ getRecommendations = getApplicantRecommendations } = {}) {
  return async (request, response, next) => {
    try {
      const result = await getRecommendations(
        request.auth.user.id,
        request.validated.query,
      );
      return response.json({ data: result });
    } catch (error) {
      return next(error);
    }
  };
}

export const getRecommendationsHandler = createGetRecommendationsHandler();
