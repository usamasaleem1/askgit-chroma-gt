import json
import os
from shutil import rmtree
import sqlite3
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
    embedding = OpenAIEmbeddings(disallowed_special=(), model='text-embedding-3-small', show_progress_bar=True)

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
    

def ingest_metadata_to_sql(repoName):
        # Extract repository name
    repo_name = repoName
    try:
        os.remove(f'{repo_name}.db')
        print(f"SUCCESS: Deleted old {repo_name}.sqlite3 file")
    except OSError as e:
        print(f"Creating {repo_name}.db file")
    # Connect to the SQLite database
    db_file = f'metadata-db/{repo_name}.db'
    
    conn = sqlite3.connect(db_file)
    cursor = conn.cursor()

    # Open and read the metadata JSON file
    with open(f'metadata-db/{repoName}.json', 'r') as file:
        metadata = json.load(file)

    # Create a table for the repository [general repo info]
    cursor.execute(f'''CREATE TABLE IF NOT EXISTS repository (
        id INTEGER PRIMARY KEY,
        author TEXT,
        owner_login TEXT,
        description TEXT,
        forks_count INTEGER,
        open_issues_count INTEGER,
        watchers INTEGER,
        last_updated TEXT
    );''')
    # Directly access the 'repository' dictionary
    repo = metadata['repository']
    author, _ = repo['author'].split('/')
    cursor.execute(f'''
    INSERT INTO repository 
    (author, owner_login, description, forks_count, open_issues_count, watchers, last_updated) 
    VALUES (?, ?, ?, ?, ?, ?, ?);
    ''', (author, repo['owner_login'], repo['description'], repo['forks_count'], repo['open_issues_count'], repo['watchers'], repo['last_updated']))        
   
    # Create a table for the issues
    cursor.execute(f'''
    CREATE TABLE IF NOT EXISTS issues (
        id INTEGER PRIMARY KEY,
        issue_number INTEGER,
        title TEXT,
        opened_by TEXT,
        labels TEXT,
        state TEXT,
        created_at TEXT,
        updated_at TEXT,
        closed_at TEXT
    );''')
    for issue in metadata['issues']:
        cursor.execute(f'''
        INSERT INTO issues 
        (issue_number, title, opened_by, labels, state, created_at, updated_at, closed_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?);
        ''', (issue['issue_number'], issue['title'], issue['opened_by'], json.dumps(issue['labels']), issue['state'], issue['created_at'], issue['updated_at'], issue['closed_at']))

    # Create a table for the pull_requests
    cursor.execute(f'''
    CREATE TABLE IF NOT EXISTS pull_requests (
        id INTEGER PRIMARY KEY,
        url TEXT,
        pr_id INTEGER,
        state TEXT,
        title TEXT,
        user_login TEXT,
        body TEXT,
        created_at TEXT,
        updated_at TEXT,
        closed_at TEXT,
        merged_at TEXT,
        merge_commit_sha TEXT,
        labels TEXT
    );''')
    for pr in metadata['pull_requests']:
        cursor.execute(f'''
        INSERT INTO pull_requests 
        (url, pr_id, state, title, user_login, body, created_at, updated_at, closed_at, merged_at, merge_commit_sha, labels) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        ''', (pr['url'], pr['id'], pr['state'], pr['title'], pr['user_login'], pr['body'], pr['created_at'], pr['updated_at'], pr['closed_at'], pr['merged_at'], pr['merge_commit_sha'], json.dumps(pr['labels'])))

    # Create a table for the branches
    cursor.execute(f'''
    CREATE TABLE IF NOT EXISTS branches (
        id INTEGER PRIMARY KEY,
        name TEXT,
        commit_sha TEXT,
        commit_url TEXT
    );''')
    for branch in metadata['branches']:
        cursor.execute(f'''
        INSERT INTO branches 
        (name, commit_sha, commit_url) 
        VALUES (?, ?, ?);
        ''', (branch['name'], branch['commit']['sha'], branch['commit']['url']))


    # Commit changes and close the connection
    conn.commit()
    print(f'Changes committed to {db_file}')
    conn.close()
    
    # delete original metadata json file
    try:
        os.remove(f'metadata-db/{repoName}.json')
        print(f"SUCCESS: Deleted {repoName} file")
    except OSError as e:
        print(f"ERROR: Could not delete {repoName} file: {e}")
