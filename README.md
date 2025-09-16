## Project setup run with docker

JANGAN LUPA SET ENV DI FE DAN BE 

ENV BE
```bash
DATABASE_URL=
PORT = 3001
AI_API_KEY =
```

ENV FE
```bash
NEXT_PUBLIC_BE_URL=http://localhost:3001
```

OR you can set env in docker-compose.yml file 

## Compile and run the project with docker

```bash
docker-compose up -d 
```

## FRONTEND
http://localhost:3000/login

