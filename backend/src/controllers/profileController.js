import { updateProfile, changePassword } from '../services/profileService.js';

export async function patchMe(req, res, next) {
  try {
    const profile = await updateProfile(req.user, req.body ?? {});
    res.status(200).json(profile);
  } catch (err) {
    next(err);
  }
}

export async function patchPassword(req, res, next) {
  try {
    await changePassword(req.user, req.body ?? {});
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
