# 👀 Описание методов api

- [Пользователи](#-users)
- [Авторизация и Регистрация](#-auth)
- [Работа с бд](#-local-database)
- [Работа с командами](#main-commands)
- [Важная информация](#warning)
- [Почта](#smtp)
- [Rabbit - рассылка email notice](#rabbit)

```
Страница генерируемая swagger - http://YOUR_HOST/api-docs
```

# 🦾 Local DataBase 
Для развертывания локальной бд необходимо установить docker 

 - Mac - https://docs.docker.com/desktop/mac/install/
 - Windows - https://docs.docker.com/desktop/windows/install/
 - Ubuntu (Linux) - ``` sudo apt install docker-compose```

Далее прописать команду
```shell
 docker-compose up -d
```
Далее необходимо выолпнить команду миграции для добавления иили обновления таблиц бд.
```shell
npm run start:migrations
```

# 🥸 Users
Single user - http://localhost:YOUR_PORT/api/users/1
All users - http://localhost:YOUR_PORT/api/users
````
Header:
x-access-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTcsImlhdCI6MTY1NDE5MjU2Mn0.FPEJdQqEAG_8w--9rER1ogTlFC77eDurX4nBVwZv98k
````

# 🥸 Auth
Для получения токена необходимо зарегестрировать нового пользователя, 
или авторизоваться текущим, в ответ вы получите массив с json данным в котором будет token

Обновления профиля - http://localhost:YOUR_PORT/api/users/update 
- Откройте http://localhost:YOUR_PORT/example для использования тестовой формы

Выход - http://localhost:YOUR_PORT/api/users/logout
- Откройте http://localhost:YOUR_PORT/logout после авторизации

Авторизация - http://localhost:YOUR_PORT/users/api/signing

Регистрация - http://localhost:YOUR_PORT/users/api/signup

````json
// JSON BODY:

{
	"username":"user1",
	"email":"test@mail.ru",
	"password":"password1"
}

````

# Rabbit
router - /sendNoticeEmail

method - POST

Body data - auth required (JWT key)
```
Headers
Content-Type: application/json
authorization: YOUR KEY
```
```Json
{
	"queueName": "YOUR QUEUE NAME",
	"from": "your email",
	"subject": "YOUR SUBJECT",
	"text": "YOUR TEXT"
}
```

# SMTP
 - В данной сборки добавлена возможность подключить локальный smtp сервер, для его включения
необходимо в .env SMTP_SERVER_ON = FALSE сменить на любое другое значения отличимое от FALSE
после чего вы сможете запустить локальный smtp сервер.
 - При необходимости вы можете так же использовать такие программы как MAMP PRO или NODEMAILER
 - Вы можете отредактировать конфиг подключения к smtp в ниже указаном файле
```javascript

//config/smtp.config.ts

export const smtpConfig = {
    name: process.env.SMTP_HOST, // smtp.yandex.ru
    host: process.env.SMTP_HOST, // smtp.yandex.ru
    port: process.env.SMTP_PORT, // 465
    logger: false,
    debug: true,
    secure: false, // true for 465, false for other ports 
    auth: {
        user: process.env.SMTP_USER, // YOUR YANDEX EMAIL
        pass: process.env.SMTP_PASSWORD, // YOUR YANDEX PASSWORD
    },
    tls: {
        rejectUnauthorized: false
    }
}
```

# Main commands
```
- npm run make:entity - генерирует роуты и все необходимые к ним файлы
- npm run make:migrate - генерирует файл для добавления данных в бд
- npm run start:migrations - запускает выполнения выше добавленного файла
- npm run make:view - генерирует страницы
- npm run zip:logs - архивирование логов
```

# Warning
``` 
ВНИМЕНИЕ УДАЛЕНИЕ ИЗ ФАЙЛЫ СТРОК С СОДЕРЖАНИЕМ /* Generate */ 
приведет к тому что скрипты отвечающие за генерацию не будут добавлять нужные строки в файлы 

ВНИМАНИЕ для подключения HTTPS необходимо изменить в .env значения NODE_USE_HTTPS = FALSE на любое другое
```
