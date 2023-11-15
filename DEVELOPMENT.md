# Docker:

Make sure you have `docker` and `docker compose` installed in your system.  

`docker-compose.dev.yml` start a mysql server and run the `dev-database.sql` to setup the schema.

```bash
sudo docker compose -f ./docker-compose.dev.yml up -d
```

Your MySQL server will be available on default port `3306` at `localhost:3306`  

It will also run phpmyadmin in the `localhost:8080` 
default credentials are
```
user: dev
password: password
```