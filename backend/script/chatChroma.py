from chromadb.utils.embedding_functions import OpenAIEmbeddingFunction
import chromadb
import os
import openai
from dotenv import load_dotenv
load_dotenv()
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq
from langchain_community.embeddings import HuggingFaceInferenceAPIEmbeddings


def chat_openai(repoName, question):

    author_repoName = repoName # input("Enter the name of the existing collection (e.g., pinecone): ")
    groq_api_key = os.environ.get('GROQ_API_KEY')
    if os.getenv("OPENAI_API_KEY") is not None:
        openai.api_key = os.getenv("OPENAI_API_KEY")
        print ("OPENAI_API_KEY is ready")
    else:
        print ("OPENAI_API_KEY environment variable not found")
    
    getquestion = ChatGroq(temperature=0, groq_api_key="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", model_name="llama3-8b-8192")
    chat = ChatGroq(temperature=0.1, groq_api_key="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", model_name="llama3-70b-8192")

    res = getquestion.invoke("""Fix any grammar mistakes and make the following codebase related question more elaborate. 
                      Only return the new question itself, nothing more. \n\nQuestion: \n""" + question)
    print(f'getquestion response: {res.content}')
    question = res.content
    
    print(f'Formatted question: {question}')
        
    EMBEDDING_MODEL = "text-embedding-3-small"
    client = chromadb.PersistentClient(path="db")
    print(client.list_collections())
    collection = client.get_collection(author_repoName)

    embedding_function = OpenAIEmbeddingFunction(api_key=os.environ.get('OPENAI_API_KEY'), model_name=EMBEDDING_MODEL)
    # using HuggingFaceInferenceAPIEmbeddings instead of OpenAIEmbeddingFunction, uncomment the line above and comment the line below to use OpenAIEmbeddingFunction
    # embedding = HuggingFaceInferenceAPIEmbeddings(
    #     api_key=huggingface_api_key,
    #     model_name="sentence-transformers/all-MiniLM-L6-v2" 
    # )   
    persist_directory = 'db'
    embedding = OpenAIEmbeddings(disallowed_special=(), show_progress_bar=True, model=EMBEDDING_MODEL)

    # ------- Now we can use the vectordb to query the documents
    # load the persisted database from disk, and use it as normal. 
    print("Loading...")
    vectordb = Chroma(
                    persist_directory=persist_directory, 
                    embedding_function=embedding,
                    collection_name=author_repoName,
                    )

    print("Retrieving...")
    retriever = vectordb.as_retriever(search_kwargs={"k": 4})
    
    template = """I want you to act as an expert assistant that helps answer questions about code. Specifically, I want you to answer questions given a snippets from a GitHub repository.
    Answer the question concisely, informatively and in detail. If you don't know the answer, say so. 
    
    IMPORTANT NOTE:
    If the user asks something too broad, that isn't code specific, e.g "What is the repo about?" or "What does this repo do?", you should say something detailed and pleasant instead, like: 
    "Hmm, I would need a more specific code related question about the repository, such as "How does authentication work for users?" or "What does y function do?" or "what does x file do?", etc. 
    To generally know what the codebase is about, you can refer to the readme file. Please ask a more specific question about the codebase. :)"

    For your information: The metadata source is the file path of the code file in the repository. 
    
    Here is the context of the repository related to the question.:
    
    {context}
    
    Question: {question}
    
    Helpful Answer:
    """

    QA_CHAIN_PROMPT = PromptTemplate(input_variables=["context", "question"], template=template)
    
    print(f'question' + question)
    # create the chain to answer questions 
    qa_chain = RetrievalQA.from_chain_type(
                                    # llm=ChatOpenAI(model_name="gpt-3.5-turbo", temperature=0.2, streaming=True, verbose=True), 
                                    llm=chat,
                                    chain_type="stuff", 
                                    retriever=retriever, 
                                    return_source_documents=True,
                                    chain_type_kwargs={"prompt": QA_CHAIN_PROMPT},
                                    )

    while True:
        # query = input("Question: ")
        query = question
        if query.strip() == "":
            continue
        res = qa_chain.invoke(query)
        process_llm_response(res)
        print(type(res))
        return res
        
## Cite sources
def process_llm_response(llm_response):
    print(type(llm_response))
    result = '\n' + llm_response['result'] + '\n\nSources:\n' + '\n'.join(source.metadata['source'] for source in llm_response["source_documents"])
    print(result)

