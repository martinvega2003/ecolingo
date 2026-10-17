import { Badge, UserBadge } from '../models/index.js';

const toCatalogShape = (badge) => ({
  code: badge.code,
  name: badge.name,
  description: badge.description,
  emoji: badge.emoji,
  displayOrder: badge.displayOrder,
});

export async function getMyBadges(req, res, next) {
  try {
    const [allBadges, unlocked] = await Promise.all([
      Badge.find().sort({ displayOrder: 1 }).lean(),
      UserBadge.find({ userId: req.user.id }).lean(),
    ]);

    const unlockedByCode = new Map(unlocked.map((ub) => [ub.badgeCode, ub.unlockedAt]));

    const badges = allBadges.map((badge) => ({
      ...toCatalogShape(badge),
      isUnlocked: unlockedByCode.has(badge.code),
      unlockedAt: unlockedByCode.get(badge.code) ?? null,
    }));

    res.json({ badges, unlockedCount: unlocked.length, totalCount: allBadges.length });
  } catch (err) {
    next(err);
  }
}

export async function getBadgeCatalog(req, res, next) {
  try {
    const allBadges = await Badge.find().sort({ displayOrder: 1 }).lean();
    res.json({ badges: allBadges.map(toCatalogShape), totalCount: allBadges.length });
  } catch (err) {
    next(err);
  }
}
