const express = require('express');
const router = express.Router();
const accessTokenPolicy = require('#policies/accessToken.policy');
const BankController = require('#controllers/api/BankController')();

router.use(accessTokenPolicy);

router.post('/deposit', BankController.deposit);
router.post('/withdraw', BankController.withdraw);
router.post('/transfer', BankController.transfer);
router.get('/history', BankController.getHistory);

module.exports = router;
