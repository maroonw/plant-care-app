const UserPlant = require('../models/UserPlant');

function daysUntil(date) {
  if (!date) return Infinity;
  const now = new Date();
  const d = new Date(date);
  return Math.ceil((d - now) / 86400000);
}

exports.getNotifications = async (req, res) => {
  try {
    const ups = await UserPlant.find({ user: req.user._id })
      .populate('plant', 'name slug images primaryImage');

    const items = [];
    for (const up of ups) {
      const plant = up.plant || {};
      const base = {
        userPlantId: up._id.toString(),
        plantId: plant._id?.toString?.(),
        plantName: plant.name,
        plantSlug: plant.slug || plant._id,
        img: plant.primaryImage?.url || plant.images?.[0]?.url || null,
      };

      const checks = [
        { type: 'water',      date: up.nextWateringDue },
        { type: 'fertilize',  date: up.nextFertilizingDue },
        { type: 'repot',      date: up.nextRepotDue },
        { type: 'rotate',     date: up.nextRotateDue },
      ];

      for (const c of checks) {
        const days = daysUntil(c.date);
        if (Number.isFinite(days) && days <= 0) {
          items.push({
            ...base,
            type: c.type,
            days,                 // <= 0 means due/overdue
            dueAt: c.date,
            priority: days < 0 ? 'overdue' : 'today',
          });
        }
      }
    }

    // Sort: overdue first, then today, then by plant name
    items.sort((a, b) => {
      const pri = (p) => (p === 'overdue' ? 0 : 1);
      if (pri(a.priority) !== pri(b.priority)) return pri(a.priority) - pri(b.priority);
      return (a.plantName || '').localeCompare(b.plantName || '');
    });

    res.json({ items });
  } catch (e) {
    console.error('getNotifications error:', e);
    res.status(500).json({ message: 'Server error' });
  }
};
