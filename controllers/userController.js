
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

        }catch(e){

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