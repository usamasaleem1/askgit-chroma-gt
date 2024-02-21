# These three lines swap the stdlib sqlite3 lib with the pysqlite3 package 
# https://docs.trychroma.com/troubleshooting#sqlite
__import__('pysqlite3')
import sys
sys.modules['sqlite3'] = sys.modules.pop('pysqlite3')

from fastapi import FastAPI
from pydantic import BaseModel
from script.downloadRepo import download_directory
from script.ingestChroma import ingestingRepositories
from script.chatChroma import chat_openai
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Model(BaseModel):
   repoUrl: str

class ModelIngest(BaseModel):
   repoName: str

class ChatModel(BaseModel):
   question: str
   repoName: str

@app.get("/")
async def index():
   return {"message": "Hello World"}

@app.post("/downloadrepo")
async def downloadRepo(req: Model):
   download_directory(req.repoUrl)
   return {"message": "Download successfully"}

@app.post("/ingesting")
async def ingestRepo(req: ModelIngest):
   ingestingRepositories(req.repoName)
   return {"message": "Ingesting repository successfully"}

@app.post('/chat')
async def chat(req: ChatModel):
   response = chat_openai(req.repoName, req.question)
   return {"message": "Chat repository response", "data": response}