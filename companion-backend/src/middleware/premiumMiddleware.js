export const premiumOnly = (req, res, next) => {
  if (req.user && req.user.plan === 'premium') {
    next();
  } else {
    return res.status(403).json({
      status: 'fail',
      message: 'This feature requires a premium subscription.'
    });
  }
};
