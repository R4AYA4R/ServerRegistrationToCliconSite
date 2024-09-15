import ApiError from "../exceptions/ApiError.js"; // указываем здесь расширение файла .js вручную,иначен не находит файл
import tokenService from "../service/tokenService.js";


// создаем и экспортируем функцию middleware,в параметрах принимает req(зарос),res(ответ),next(вызывает следующий в цепочке middleware),чтобы в данном случае получать доступ к изменениню данных пользователя можно было только зарегестрированным пользователям,у которых есть access токен
export default function (req,res,next){
    // оборачиваем в try catch,чтобы отлавливать ошибки
    try{

        const authorizationHeader = req.headers.authorization; // помещаем в переменную authorizationHeader access токен из поля authorization у поля headers у запроса

        // если authorizationHeader false(или null),то есть этот header(заголовок) с токеном не указан
        if(!authorizationHeader){
            return next(ApiError.UnauthorizedError()); // возвращаем функцию next(),которая по цепочке вызывает следующий middleware(в данном случае это будет наш errorMiddleware,который обработает эту ошибку и покажет ее),и в параметрах указываем нашу функцию UnauthorizedError() у ApiError,которая бросает ошибку и сообщение ошибки
        }

        const accessToken = authorizationHeader.split(' ')[1];  // разбиваем строку authorizationHeader по пробелу(эта строка состоит из типа токена и самого токена,типа Bearer(тип токена) lakdfa7889a7faknflajf(и типа сам токен)),и получаем массив из разбитых отдельных слов,и помещаем элемент этого нового массива по индексу 1(это и будет accessToken) в переменную accessToken

        // если accessToken false(или null),то есть accessToken нету
        if(!accessToken){   
            return next(ApiError.UnauthorizedError()); // возвращаем функцию next(),которая по цепочке вызывает следующий middleware,и в параметрах указываем нашу функцию UnauthorizedError() у ApiError,которая бросает ошибку и сообщение ошибки
        }

        const userData = tokenService.validateAccessToken(accessToken); // используем нашу функцию validateAccessToken(),чтобы провалидировать(верифицировать) токен,то есть в этой функции достаем из токена payload(данные,которые были помещеные в этот токен),если верификация прошла успешно, и эти данные помещаем в переменную userData

        // если userData false(или null),то есть если в userData ничего нет(если наша функция validateAccessToken вернула null при верификации)
        if(!userData){
            return next(ApiError.UnauthorizedError()); // возвращаем функцию next(),которая по цепочке вызывает следующий middleware,и в параметрах указываем нашу функцию UnauthorizedError() у ApiError,которая бросает ошибку и сообщение ошибки
        }

        req.user = userData; // в поле user у запроса помещаем userData(данные о пользователе,полученные из токена)

        next(); // вызываем функцию next(),тем самым передаем управление следующему middleware

    }catch(e){
        return next(ApiError.UnauthorizedError()); // возвращаем функцию next(),которая по цепочке вызывает следующий middleware,и в параметрах указываем нашу функцию UnauthorizedError() у ApiError,которая бросает ошибку и сообщение ошибки
    }
}