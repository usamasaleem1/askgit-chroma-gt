## Run

1. Install dependencies using pnpm:

```sh
pnpm install
```

1. Copy `.env.example` to `.env` and update the variables.

```sh
cp .env.local.example .env
```

3. Fill env variables. Set DATABASE_URL to match your database:

```sh
mysql://user:pass@127.0.0.1:3306/<databasename>
```

4. Run migrate to create intialize db
```sh
npm run migrate
```

5. Start the frontend:
```sh
pnpm dev
```

6. Start the backend server:

```sh
cd backend
pip install requirements.txt
uvicorn main:app --reload
```

