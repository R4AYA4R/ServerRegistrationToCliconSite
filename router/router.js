import { Router } from "express"; // импортируем Router из express

import userController from "../controllers/userController.js"; // импортируем наш userController,в данном случае указываем расширение .js для файла userController(иначе не работает,не находит файл) 

const router = new Router(); // создаем экземпляр роутера

// обозначаем,какие эндпоинты в приложении у нас будут
router.post('/registration',userController.registration); // указываем post запрос для регистрации по маршруту /registration,вторым параметром указываем middleware(функцию body для валидации),указываем в параметре body() названия поля из тела запроса,которое хотим провалидировать(в данном случае это email),и указываем валидатор isEmail() для проверки на email,также валидируем и пароль,но там уже указываем валидатор isLength(),куда передаем объект и поля min(минимальное количество) и max(максимальное) по количеству символов,третьим параметром указываем функцию registration из нашего userController для регистрации,которая будет отрабатывать на этом эндпоинте

router.post('/login',userController.login); // указываем post запрос для логина

router.post('/logout',userController.logout); // указываем post запрос для выхода из аккаунта

router.get('/activate/:link',userController.activate); // указываем get запрос для активации аккаунта по ссылке,которая будет приходить на почту,/:link - значит,что параметр link(ссылка) динамический(то есть разный)

router.get('/refresh',userController.refresh); // указываем get запрос для перезаписывания access токена,если он умер(то есть здесь будем отправлять refresh токен и получать обратно пару access и refresh токенов)

export default router; // экспортируем наш router