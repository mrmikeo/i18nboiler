const express 		= require('express');
var router 			= express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {

	if (req.query.locale)
	{
		req.session.locale = req.query.locale;
		req.session.save(); 
		return res.redirect('/');
	}
	

	res.render('index', { title: 'pwaboiler', csrfToken: req.csrfToken(), sessionId: req.session.id, messages: req.flash(), locale: req.session.locale });
  
});

/* GET home page. */
router.get('/test', function(req, res, next) {

	if (req.query.locale)
	{
		req.session.locale = req.query.locale;
		req.session.save(); 
		return res.redirect('/text');
	}
	

	res.render('test', { title: 'pwaboiler', csrfToken: req.csrfToken(), sessionId: req.session.id, messages: req.flash(), locale: req.session.locale });
  
});

module.exports = router;
