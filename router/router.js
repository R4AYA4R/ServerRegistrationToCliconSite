import { Router } from "express"; // импортируем Router из express

import userController from "../controllers/userController.js"; // импортируем наш userController,в данном случае указываем расширение .js для файла userController(иначе не работает,не находит файл) 

import { body } from "express-validator"; // импортируем функцию body из express-validator для валидации тела запроса
import authMiddleware from "../middlewares/authMiddleware.js";

const router = new Router(); // создаем экземпляр роутера

// обозначаем,какие эндпоинты в приложении у нас будут
router.post('/registration',
    body('email').isEmail(),
    body('password').isLength({min:3,max:32}),
    userController.registration); // указываем post запрос для регистрации по маршруту /registration,вторым параметром указываем middleware(функцию body для валидации),указываем в параметре body() названия поля из тела запроса,которое хотим провалидировать(в данном случае это email),и указываем валидатор isEmail() для проверки на email,также валидируем и пароль,но там уже указываем валидатор isLength(),куда передаем объект и поля min(минимальное количество) и max(максимальное) по количеству символов,третьим параметром указываем функцию registration из нашего userController для регистрации,которая будет отрабатывать на этом эндпоинте

router.post('/login',userController.login); // указываем post запрос для логина

router.post('/logout',userController.logout); // указываем post запрос для выхода из аккаунта

router.post('/changeAccInfo',authMiddleware,body('email').isEmail(),userController.changeAccInfo); // указываем post запрос для изменения данных пользователя в базе данных,вторым параметром указываем authMiddleware для проверки на access токен у пользователя,если он есть и он еще годен по сроку жизни этого токена(мы этот срок указали при создании токена),то будет выполнена функция changePass,если нет,то не будет и будет ошибка,третьим параметром указываем middleware(функцию body для валидации),указываем в параметре body() названия поля из тела запроса,которое хотим провалидировать(в данном случае это email),и указываем валидатор isEmail() для проверки на email

router.post('/changePass',authMiddleware,userController.changePass); // указываем post запрос для изменения пароля пользователя в базе данных,вторым параметром указываем authMiddleware для проверки на access токен у пользователя,если он есть и он еще годен по сроку жизни этого токена(мы этот срок указали при создании токена),то будет выполнена функция changePass,если нет,то не будет и будет ошибка

router.post('/uploadFile',authMiddleware,userController.uploadFile); // указываем post запрос для загрузки файла с фронтенда на наш node js сервер(в данном случае в папку static),вторым параметром указываем наш authMiddleware для проверки на access токен

router.delete('/deleteFile/:fileName',userController.deleteFile); // указываем delete запрос для удаления файла с нашего node js сервера(в данном случае из папки static),delete запрос не имеет тела запроса и все параметры передаются через строку

router.get('/activate/:link',userController.activate); // указываем get запрос для активации аккаунта по ссылке,которая будет приходить на почту,/:link - значит,что параметр link(ссылка) динамический(то есть разный)

// router.get('/auth',userController.authCheck); // указываем get запрос для проверки access токена,авторизован ли пользователь,в данном случае это отдельный эндпоинт вместо authMiddleware,делаем все проверки как в authMiddleware,только уже в самой функции эндпоинта(лучше так не использовать,а использовать как отдельный authMiddleware перед основной функцией эндпоинта,так как не работает правильно)


router.get('/refresh',userController.refresh); // указываем get запрос для перезаписывания access токена,если он умер(то есть здесь будем отправлять refresh токен и получать обратно пару access и refresh токенов),если у access токена время действия закончилось,то мы с фронтенда делаем запрос на /refresh,перезаписываем там access и refresh токены,и тогда,если аккаунт украли и у мошенника закончилсоь время жизни access токена,то делается запрос на /refresh,но уже у него access и refresh токены не действительны и он не может получить доступ к сервисам,authMiddleware нужен,чтобы защитить пользователя от мошенников,так как,когда истекает access токен,идет запрос на refresh токен,и после этого обновляется и access токен,и refresh токен,соответственно мошенник уже не может получить доступ к этому эндпоинту(маршруту по url),так как его refresh и access токен будут уже не действительны,а функция checkAuth нужна для проверки только refresh токена(то есть,если пользователь вообще не пользовался сервисом какое-то время(которое указали у жизни refresh токена),нужно именно не переобновлять страницы и тд,чтобы не шел запрос на /refresh(иначе refresh токен будет переобновляться с каждым запросом,нужно,чтобы refresh токен истек до запроса на /refresh),то его refresh токен истечет и его выкинет с аккаунта после обновления страницы,но если пользователь будет использовать в данном случае,например,функцию authMiddleware,то его access токен и refresh токен будут заново перезаписаны и таймер на время жизни refresh токена будет обновлен и заново запущен,поэтому его не будет выкидывать из аккаунта) 


//authMiddleware нужен,чтобы защитить пользователя от мошенников,так как,когда истекает access токен,идет запрос на refresh токен,и после этого обновляется и access токен,и refresh токен,соответственно мошенник уже не может получить доступ к этому эндпоинту(маршруту по url),так как его refresh и access токен будут уже не действительны,а функция checkAuth нужна для проверки только refresh токена(то есть,если пользователь вообще не пользовался сервисом какое-то время(которое указали у жизни refresh токена),нужно именно не переобновлять страницы и тд,чтобы не шел запрос на /refresh(иначе refresh токен будет переобновляться с каждым запросом,нужно,чтобы refresh токен истек до запроса на /refresh),то его refresh токен истечет и его выкинет с аккаунта после обновления страницы,но если пользователь будет использовать в данном случае,например,функцию authMiddleware,то его access токен и refresh токен будут заново перезаписаны и таймер на время жизни refresh токена будет обновлен и заново запущен,поэтому его не будет выкидывать из аккаунта) 

export default router; // экспортируем наш router