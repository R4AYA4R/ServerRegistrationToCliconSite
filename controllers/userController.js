

// создаем класс для UserController,где будем описывать функции для эндпоинтов
class UserController{
    // указываем фукнцию для эндпоинта регистрации,в параметре указываем req(запрос),res(ответ) и next(мидлвэир)
    async registration(req,res,next){
        try{

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