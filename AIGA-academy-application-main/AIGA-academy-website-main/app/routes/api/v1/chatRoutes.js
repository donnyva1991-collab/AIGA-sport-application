const express = require('express');
const router = express.Router();

// Контроллер чата
const ChatController = require('#controllers/api/ChatController')();

// Middleware для проверки токена (JWT)
const accessTokenPolicy = require('#policies/accessToken.policy');

// Защищаем все маршруты токеном(но не от меня) инста @eternal_kazakh
router.use(accessTokenPolicy);

//  POST /chat/send — отправка сообщения
router.post('/send', ChatController.sendMessage);

// GET /chat/:userId — получить историю чата с другим пользователем(задалбала робота с коммами)
router.get('/:userId', ChatController.getDialog);

module.exports = router;


// Получить историю сообщений сообщества (room)
router.get('/room/:room', async (req, res) => {
  const room = req.params.room;

  try {
    const messages = await Message.findAll({
      where: { room },
      order: [['createdAt', 'ASC']]
    });

    return createOKResponse({ res, content: { messages } });
  } catch (error) {
    return createErrorResponse({ res, error });
  }
});
