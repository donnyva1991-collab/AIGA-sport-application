const express = require('express');
const router = express.Router();
const accessTokenPolicy = require('#policies/accessToken.policy');
const ProductController = require('#controllers/api/ProductController')();

router.use(accessTokenPolicy);
router.get('/', ProductController.getProducts);
router.post('/buy', ProductController.buyProduct);

module.exports = router;
