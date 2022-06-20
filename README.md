# 👀 Описание методов api

- [Пользователи](#-users)
- [Авторизация и Регистрация](#-auth)
- [Работа с бд](#-local-database)
- [Работа с командами](#main-commands)
- [Важная информация](#warning)

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
Single user - http://localhost:3000/api/users/1
All users - http://localhost:3000/api/users
````
Header:
x-access-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTcsImlhdCI6MTY1NDE5MjU2Mn0.FPEJdQqEAG_8w--9rER1ogTlFC77eDurX4nBVwZv98k
````

# 🥸 Auth
Для получения токена необходимо зарегестрировать нового пользователя, 
или авторизоваться текущим, в ответ вы получите массив с json данным в котором будет token

Signing - http://localhost:3000/api/signing

Signup - http://localhost:3000/api/signup
````json
// JSON BODY:

{
	"username":"user1",
	"email":"test@mail.ru",
	"password":"password1"
}

````

# Main commands
``
- npm run make:entity - генерирует роуты и все необходимые к ним файлы
- npm run make:migrate - генерирует файл для добавления данных в бд
- npm run start:migrations - запускает выполнения выше добавленного файла
- npm run make:view - генерирует страницы
``

# Warning
``` 
ВНИМЕНИЕ УДАЛЕНИЕ ИЗ ФАЙЛЫ СТРОК С СОДЕРЖАНИЕМ /* Generate */ 
приведет к тому что скрипты отвечающие за генерацию не будут добавлять нужные строки в файлы 
```
