## Run

1. Install dependencies using pnpm:

```sh
pnpm install
```

2. Copy `.env.local.example` to `.env.local` and update the variables.

```sh
cp .env.local.example .env.local
```

3. Run frontend:
```sh
pnpm dev
```

4. Start the backend server:

```sh
cd backend
uvicorn main:app --reload
```
----
If you have any issues with the db stuff, delete backend/script/db and also run in root folder:
```sh
npm run migrate
```
to create a new database 
