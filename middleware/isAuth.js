const isAuth = (req, res, next) => {
  if (req.session.isAuth) {
    next();
  } else {
    return res.status(401).json("Please Login, Session is Expired");
  }
};

module.exports = {isAuth};