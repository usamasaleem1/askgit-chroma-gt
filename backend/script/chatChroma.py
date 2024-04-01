from chromadb.utils.embedding_functions import OpenAIEmbeddingFunction
import chromadb
import os
import openai
from dotenv import load_dotenv
load_dotenv()
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq
from langchain_core.output_parsers import StrOutputParser
from operator import itemgetter
from langchain_core.runnables import RunnablePassthrough
from langchain.load import dumps, loads

def chat_openai(repoName, question):
    groq_api_key = os.environ.get('GROQ_API_KEY')
    
    
    author_repoName = repoName # input("Enter the name of the existing collection (e.g., pinecone): ")
    if os.getenv("OPENAI_API_KEY") is not None:
        openai.api_key = os.getenv("OPENAI_API_KEY")
        print ("OPENAI_API_KEY is ready")
    else:
        print ("OPENAI_API_KEY environment variable not found")

    chatgroq = ChatGroq(temperature=0.2, groq_api_key=groq_api_key, model_name="mixtral-8x7b-32768")
    chatopenai = ChatOpenAI(model_name="gpt-3.5-turbo", temperature=0.3, streaming=True, verbose=True)
    EMBEDDING_MODEL = "text-embedding-3-small"
    client = chromadb.PersistentClient(path="db")
    print(client.list_collections())
    collection = client.get_collection(author_repoName)

    embedding_function = OpenAIEmbeddingFunction(api_key=os.environ.get('OPENAI_API_KEY'), model_name=EMBEDDING_MODEL)

    persist_directory = 'db'
    embedding = OpenAIEmbeddings(disallowed_special=())

    # ------- Now we can use the vectordb to query the documents
    # load the persisted database from disk, and use it as normal. 
    print("Loading...")
    vectordb = Chroma(persist_directory=persist_directory, 
                    embedding_function=embedding,
                    collection_name=author_repoName,
                    )

    print("Retrieving...")
    retriever = vectordb.as_retriever(search_kwargs={"k": 4})
    
    template1 = """You are a helpful assistant that generates multiple search queries based on a single input query. 
    The query is a question about a github repo, so you need to find 4 different ways to phrase it, using the same meaning but different words and more detail. 
    \n\n
    Generate multiple similar search queries related to: {question} 
    \n
    Output (4 queries):"""
    prompt_rag_fusion = ChatPromptTemplate.from_template(template1)
    
    generate_queries = (
        prompt_rag_fusion 
        | chatgroq
        | StrOutputParser() 
        | (lambda x: print(x) or x.split("\n"))  # Print the generated queries when called
    )
    
    retrieval_chain_rag_fusion = generate_queries | retriever.map()

    results = retrieval_chain_rag_fusion.invoke(question)

    lst=[]
    for ddxs in results:
        for ddx in ddxs:
            if ddx.page_content not in lst:
                lst.append(ddx.page_content)
                #print(ddx.page_content)
    
    # Reciprocal rank fusion algorithm (RRF)
    fused_scores = {}
    k=60
    for docs in results:
        for rank, doc in enumerate(docs):
            doc_str = dumps(doc)
            # If the document is not yet in the fused_scores dictionary, add it with an initial score of 0
            # print('\n')
            if doc_str not in fused_scores:
                fused_scores[doc_str] = 0
                # Retrieve the current score of the document, if any
                previous_score = fused_scores[doc_str]
                # Update the score of the document using the RRF formula: 1 / (rank + k)
                fused_scores[doc_str] += 1 / (rank + k)

    # final reranked result
    reranked_results = [
        (loads(doc), score)
        for doc, score in sorted(fused_scores.items(), key=lambda x: x[1], reverse=True)
    ]
    
    # print sources
    unique_sources = set()
    for doc, score in reranked_results:
        source = doc.metadata['source']
        source = source.replace(".txt", "").replace(".git", "")  # Remove .txt and .git from the source
        if source not in unique_sources:
            print(source)
            unique_sources.add(source)
    
    template = """I want you to act as a coding expert, and an expert on the contents of a github repository. 
    Answer the question concisely and informatively. If you need more information, ask for it. If you don't know the answer, say so. 
    Here is the content of the repository:
    {context}
    Question: {question}
    Helpful Answer:"""
    
    prompt = ChatPromptTemplate.from_template(template)

    final_rag_chain = (
        prompt
        | chatgroq
        | StrOutputParser()
    )
    
    QA_CHAIN_PROMPT = PromptTemplate(input_variables=["context", "question"], template=template)
    
    # create the chain to answer questions 
    # qa_chain = RetrievalQA.from_chain_type(
    #                                 # llm=ChatOpenAI,
    #                                 llm=ChatGroq,
    #                                 chain_type="stuff", 
    #                                 retriever=retriever, 
    #                                 return_source_documents=True,
    #                                 chain_type_kwargs={"prompt": QA_CHAIN_PROMPT},
    #                                 )
    
    # convert unique sources to a string
    sources_output = "\n\nHere are my source(s): \n\n"
    for i in unique_sources:
        sources_output += "\n• " + i + "\n"
        
    while True:
        # query = input("Question: ")
        # query = question
        # if query.strip() == "":
        #     continue
        # res = qa_chain.invoke(query)
        # process_llm_response(res)
        # print(type(res))
        # return res
        res = final_rag_chain.invoke({"context":reranked_results,"question":question})
        res = res.strip() + sources_output
        # process_llm_response(res)

        return res

        
## Cite sources
def process_llm_response(llm_response):
    print(type(llm_response))
    result = '\n' + llm_response['result'] + '\n\nSources:\n' + '\n'.join(source.metadata['source'].replace(".git", "") for source in llm_response["source_documents"])
    print(result)

