const is_login = async (req, res, next) => {
    try {
      if (req.session.admin_name) {
        next();
      } else {
        res.redirect('/admin');
      }
    } catch (error) {
      console.log(error);
      res.status(500).send('Internal Server Error');
    }
  };

  const is_logout = async (req, res, next) => {
    try {
      if (req.session.admin_name) {
        res.redirect('/admin/home');
      } else {
        next();
      }
    } catch (error) {
      console.log(error);
      res.status(500).send('Internal Server Error');
    }
  };

module.exports = {
    is_login,
    is_logout
}