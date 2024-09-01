
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
        // оборачиваем в блок try catch,чтобы отлавливать ошибки
        try{

            const {email,password} = req.body;  // достаем(деструктуризируем) из тела запроса поля email и password

            const userData = await userService.login(email,password);  // вызываем нашу функцию login из userService,передаем туда email и password,эта функция возвращает refreshToken и userDto(объект пользователя с полями id,email,isActivated) и помещаем эти данные в переменную userData

            res.cookie('refreshToken',userData.refreshToken,{maxAge:30 * 24 * 60 * 60 * 1000,httpOnly:true}); // будем хранить refresh токен в cookie,вызываем функцю cookie() у res и передаем первым параметром название,по которому этот cookie будет храниться,а вторым параметром передаем сам cookie(то есть наш рефреш токен),третьим параметром передаем объект опций,указываем maxAge:30 дней умножаем на 24 часа * на 60 минут * 60 секунд * 1000 миллисекунд(это значит,что этот cookie будет жить 30 дней,указываем таким образом,потому что по другому указать тут нельзя ),указываем httpOnly:true(чтобы этот cookie нельзя было изменять и получать внутри браузера),если используем https,то можно добавить флаг secure:true(это тоже самое,что httpOnly только для https)

            return res.json(userData); // возвращаем на клиент объект userData с помощью json()

        }catch(e){

            next(e); // вызываем функцию next()(параметр этой функции login) и туда передаем ошибку,если в этот next() попадает ApiError(наш класс обработки ошибок),он будет там обработан,вызывая эту функцию next(),мы попадаем в наш middleware error-middleware(который подключили в файле index.js)

        }
    }

    async logout(req,res,next){
        // оборачиваем в блок try catch,чтобы отлавливать ошибки
        try{
            const {refreshToken} = req.cookies; // достаем(деструктуризируем) refreshToken из cookies,то есть из запроса из поля cookies 

            const token = await userService.logout(refreshToken); // вызываем нашу функцию logout() и передаем туда refreshToken

            res.clearCookie('refreshToken'); // удаляем саму куку(cookie) с рефреш токеном,указываем функцию clearCookie() и передаем туда название cookie,которое хранит refreshToken

            return res.json(token); // возвращаем на клиент сам token(в данном случае это будет удаленный объект из базы данных у tokenModel,со значением refreshToken как и у refreshToken,который мы взяли из запроса из cookies(req.cookies))

        }catch(e){

            next(e); // вызываем функцию next()(параметр этой функции registration) и туда передаем ошибку,если в этот next() попадает ApiError(наш класс обработки ошибок),он будет там обработан,вызывая эту функцию next(),мы попадаем в наш middleware error-middleware(который подключили в файле index.js)

        }
    }

    // функция для эндпоинта активации аккаунта
    async activate(req,res,next){
        // оборачиваем в блок try catch,чтобы отлавливать ошибки
        try{
            const activationLink = req.params.link; // получаем из параметров запроса ссылку активации(link),ее мы указывали как динамический параметр у эндпоинта /activate,поэтому ее мы можем взять и помещаем ее в переменную activationLink

            await userService.activate(activationLink); // вызываем нашу функцию activate,куда передаем эту ссылку для активации аккаунта activationLink

            return res.redirect(process.env.CLIENT_URL);  // возвращаем у res вызываем функцию redirect(),которая перенаправляет пользователя на другой url,указываем в параметре этот url(куда нужно направить пользователя),в данном случае вынесли этот url в переменную окружения,это чтобы если backend и frontend находятся на разных хостах,перенаправлять пользователя на фронтенд хост после активации аккаунта,по умолчанию react приложения запускаются на 3000 порту,а в данном случае мы запустили бэкэнд на 5000 порту

        }catch(e){

            next(e); // вызываем функцию next()(параметр этой функции registration) и туда передаем ошибку,если в этот next() попадает ApiError(наш класс обработки ошибок),он будет там обработан,вызывая эту функцию next(),мы попадаем в наш middleware error-middleware(который подключили в файле index.js)
            
        }
    }

    // функция для эндпоинта refresh токена
    async refresh(req,res,next){
        // оборачиваем в блок try catch,чтобы отлавливать ошибки
        try{
            const {refreshToken} = req.cookies; // достаем(деструктуризируем) refreshToken из cookies,то есть из запроса из поля cookies 

            const userData = await userService.refresh(refreshToken); // вызываем нашу функцию refresh из userService,передаем туда refreshToken,эта функция возвращает refreshToken,accessToken и userDto(объект пользователя с полями id,email,isActivated) и помещаем эти данные в переменную userData

            res.cookie('refreshToken',userData.refreshToken,{maxAge: 30 * 24 * 60 * 60 * 1000,httpOnly:true}); // будем хранить refresh токен в cookie,вызываем функцю cookie() у res и передаем первым параметром название,по которому этот cookie будет храниться,а вторым параметром передаем сам cookie(то есть наш рефреш токен),третьим параметром передаем объект опций,указываем maxAge:30 дней умножаем на 24 часа * на 60 минут * 60 секунд * 1000 миллисекунд(это значит,что этот cookie будет жить 30 дней,указываем таким образом,потому что по другому указать тут нельзя ),указываем httpOnly:true(чтобы этот cookie нельзя было изменять и получать внутри браузера),если используем https,то можно добавить флаг secure:true(это тоже самое,что httpOnly только для https)

            return res.json(userData); // возвращаем на клиент объект userData с помощью json()

        }catch(e){
            next(e);  // вызываем функцию next()(параметр этой функции registration) и туда передаем ошибку,если в этот next() попадает ApiError(наш класс обработки ошибок),он будет там обработан,вызывая эту функцию next(),мы попадаем в наш middleware error-middleware(который подключили в файле index.js)
        }
    }
}

export default new UserController(); // экспортируем уже объект на основе нашего класса UserController