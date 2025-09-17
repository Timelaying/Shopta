import { RequestHandler } from 'express';
import { AuthenticatedRequest } from '../middleware/jwtMiddleware';
import * as ReferralsModel from '../models/referrals.model';

export const getReferralProfile: RequestHandler = async (req, res, next) => {
  const authReq = req as AuthenticatedRequest;
  if (!authReq.user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  try {
    const profile = await ReferralsModel.getReferralProfile(Number(authReq.user.id));
    res.json(profile);
  } catch (error) {
    next(error);
  }
};

export const regenerateReferralCode: RequestHandler = async (req, res, next) => {
  const authReq = req as AuthenticatedRequest;
  if (!authReq.user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  try {
    const code = await ReferralsModel.regenerateReferralCode(Number(authReq.user.id));
    res.status(201).json({ referralCode: code });
  } catch (error) {
    next(error);
  }
};

export const getReferralLeaderboard: RequestHandler = async (_req, res, next) => {
  try {
    const leaders = await ReferralsModel.getTopReferrers();
    res.json({ leaders });
  } catch (error) {
    next(error);
  }
};
