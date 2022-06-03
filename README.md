# 👀 Описание методов api

- [Пользователи](#-users)
- [Авторизация и Регистрация](#-auth)

## 🥸 Users
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
