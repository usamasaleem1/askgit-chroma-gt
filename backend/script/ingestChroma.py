import os
from shutil import rmtree
from langchain_community.vectorstores import Chroma
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_openai import ChatOpenAI, OpenAI, OpenAIEmbeddings
from langchain.chains import RetrievalQA
from langchain_community.document_loaders import TextLoader
from langchain_community.document_loaders import DirectoryLoader
from dotenv import load_dotenv
load_dotenv()
import openai

def ingestingRepositories(repoName):
    print("LOADED INGEST.PY")
    os.environ["OPENAI_API_KEY"] = os.getenv("OPENAI_API_KEY")
    # Load and process the text files
    loader = DirectoryLoader(f'./{repoName}.git', glob="./*.txt", loader_cls=TextLoader)
    # Supplying a persist_directory will store the embeddings on disk
    persist_directory = 'db'
    author_repoName = repoName # input("Enter the name of the collection (e.g., pinecone): ")

    documents = loader.load()

    #splitting the text into
    print("Splitting...")
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1200, chunk_overlap=200)
    texts = text_splitter.split_documents(documents)

    # Embed and store the texts
    ## here we are using OpenAI embeddings but in future we will swap out to local embeddings
    print("Embedding...")
    embedding = OpenAIEmbeddings(disallowed_special=())

    import time
    start_time = time.time()

    print("Ingesting...")
    try:
        vectordb = Chroma.from_documents(documents=texts, 
                                        embedding=embedding,
                                        persist_directory=persist_directory,
                                        collection_name=author_repoName,
                                        )
    except TimeoutError:
        print("The operation timed out.")
        return {"message": "The operation timed out."}        
    except Exception as e:
        print(f"ERROR: {e}")
        return {"message": f"ERROR: {e}"}
    # delete RepoContents folder if it exists
    if os.path.exists('RepoContents'):
        rmtree('RepoContents')
    # delete data_backup folder if it exists
    if os.path.exists('repodata_txt'):
        rmtree('repodata_txt')
    
    data_backup_path = f"{repoName}.git"
    try:
        rmtree(data_backup_path)
        print(f"SUCCESS: Deleted cloned {data_backup_path} folder")
    except OSError as e:
        print(f"ERROR: Could not delete cloned {data_backup_path} folder: {e}")
    end_time = time.time()
    print(f"Time taken to ingest: {end_time - start_time} seconds")

    # # persiste the db to disk
    vectordb.persist()
    vectordb = None
    
    print("Ingestion script complete")
    

