## Run

1. Install dependencies using pnpm:

```sh
pnpm install
```

2. Copy `.env.local.example` to `.env.local` and update the variables.

```sh
cp .env.local.example .env.local
```

3. Edit schema.prima to match your database

```sh
mysql://user:pass@127.0.0.1:3306/<databasename>
```

4. Start the frontend:
```sh
pnpm dev
```

5. Start the backend server:

```sh
cd backend
pip install requirements.txt
uvicorn main:app --reload
```
----
If you have any issues with the db stuff, delete backend/script/db and also run in root folder:
```sh
npm run migrate
```
to create a new database 
