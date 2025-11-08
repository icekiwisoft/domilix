## Steps ton Lunche this project
 
1. install dependencies using <b>composer install</b>
2. create a new <b>.env</b> file at the root of your project
3. Copy <b> .env.example</b> and paste it in  <b>.env </b>
4. Then generate a key with the command <b>php artisan key:generate</b>
5. php artisan jwt:secret
6. php artisan migrate --seed
7. php artisan serve
