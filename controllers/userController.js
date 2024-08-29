
import { validationResult } from "express-validator";  // импортируем validationResult из express-validator,для получения результата валидации

import ApiError from "../exceptions/ApiError.js"; // импортируем наш класс ApiError для обработки ошибок
import userService from "../service/userService.js";

// создаем класс для UserController,где будем описывать функции для эндпоинтов
class UserController{
    // указываем фукнцию для эндпоинта регистрации,в параметре указываем req(запрос),res(ответ) и next(мидлвэир)
    async registration(req,res,next){
        try{

            const errors = validationResult(req);  // используем validationResult и передаем туда запрос(req),из него автоматически достанутся необходимые поля и провалидируются,и помещаем ошибки валидации в переменную errors

            // если errors.isEmpty() false,то есть массив ошибок не пустой
            if(!errors.isEmpty()){
                return next(ApiError.BadRequest('Ошибка при валидации',errors.array())); // возвращаем функцию next(),вызываем функцию next()(параметр этой функции registration),то есть если была ошибка при валидации,то передаем ее в наш error-middleware,и в параметре next() указываем наш ApiError и у него указываем функцию BadRequest(она вернет объект,созданный на основе класса ApiError),куда передаем сообщение для ошибки и массив ошибок,полученных при валидации с помощью errors.array()
            }

            const {email,password} = req.body; // вытаскиваем(деструктуризируем) из тела запроса поля email и password

            const userData = await userService.registration(email,password); // так как функция registration из нашего userService асинхронная,то указываем await,вызываем нашу функцию registration из userService,передаем туда email и password,в переменную userData помещаем токены и информацию о пользователе(это возвращает наша функция registration() из userService)

            res.cookie('refreshToken',userData.refreshToken,{maxAge:30 * 24 * 60 * 60 * 1000,httpOnly:true}); // будем хранить refresh токен в cookie,вызываем функцю cookie() у res и передаем первым параметром название,по которому этот cookie будет храниться,а вторым параметром передаем сам cookie,(данные,которые будут храниться в cookie,то есть наш рефреш токен),третьим параметром передаем объект опций,указываем maxAge:30 дней умножаем на 24 часа * на 60 минут * 60 секунд * 1000 миллисекунд(это значит,что этот cookie будет жить 30 дней,указываем таким образом,потому что по другому указать тут нельзя ),указываем httpOnly:true(чтобы этот cookie нельзя было изменять и получать внутри браузера),если используем https,то можно добавить флаг secure:true(это тоже самое,что httpOnly только для https)

            return res.json(userData); // возвращаем на клиент объект userData с помощью json()

        }catch(e){

            next(e); // вызываем функцию next()(параметр этой функции registration) и туда передаем ошибку,если в этот next() попадает ApiError(наш класс обработки ошибок),он будет там обработан,вызывая эту функцию next(),мы попадаем в наш middleware error-middleware(который подключили в файле index.js)
            
        }
    }

    async login(req,res,next){
        try{

        }catch(e){

        }
    }

    async logout(req,res,next){
        try{

        }catch(e){

        }
    }

    // функция для эндпоинта активации аккаунта
    async activate(req,res,next){
        try{

        }catch(e){

        }
    }

    // функция для эндпоинта refresh токена
    async refresh(req,res,next){
        try{
            res.json('Сервер работает');
        }catch(e){

        }
    }
}

export default new UserController(); // экспортируем уже объект на основе нашего класса UserController