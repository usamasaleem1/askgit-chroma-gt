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
import os
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from dotenv import load_dotenv
load_dotenv()
import openai
from langchain.chains import RetrievalQA
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAI, OpenAIEmbeddings
from langchain.prompts import PromptTemplate
from langchain_community.utilities import SQLDatabase
from langchain.chains import create_sql_query_chain, LLMMathChain
from langchain_openai import ChatOpenAI
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnablePassthrough
from operator import itemgetter
from langchain_community.tools.sql_database.tool import QuerySQLDataBaseTool
from langchain.agents import AgentType, Tool, initialize_agent, create_react_agent, AgentExecutor, create_structured_chat_agent
from langchain_groq import ChatGroq
from langchain.tools import BaseTool
from langchain.callbacks.manager import (
    AsyncCallbackManagerForToolRun,
    CallbackManagerForToolRun,
)
from typing import Optional, Type
from langchain.agents.agent_toolkits import SQLDatabaseToolkit
from langchain.agents import AgentType, tool, create_sql_agent


from langchain.agents import create_sql_agent
from langchain.agents.types import AgentType

if os.getenv("OPENAI_API_KEY") is not None:
    openai.api_key = os.getenv("OPENAI_API_KEY")
    print ("OPENAI_API_KEY is ready")
else:
    print ("OPENAI_API_KEY environment variable not found")
    
groq_api_key = os.environ.get('GROQ_API_KEY')

gpt = OpenAI(temperature=0)
groq = ChatGroq(temperature=0.2, groq_api_key=groq_api_key, model_name="mixtral-8x7b-32768")
llm = ChatOpenAI(model_name="gpt-3.5-turbo", temperature=0.2, streaming=True, verbose=True)


persist_directory = 'db'
embedding = OpenAIEmbeddings(disallowed_special=())
tool_names = ["Codebase QA System", "Metadata QA System"]
askgit_prompt = '''Answer the following questions as best you can. Be detailed in your final answer. You have access to the following tools:

            {tools}

            Here is the structure of the SQL database:
            table names: repository, issues, pull_requests, branches
            
            Repository Table:
                - The repository table stores general information about a repository.
                - Each entry in this table represents a single repository.
                - It includes columns such as:
                - id: An integer serving as the primary key.
                - author: Text field representing the author of the repository.
                - owner_login: Text field containing the login name of the repository owner.
                - description: Text field for the description of the repository.
                - forks_count: Integer field indicating the number of forks for the repository.
                - open_issues_count: Integer field indicating the count of open issues in the repository.
                - watchers: Integer field representing the number of users watching the repository.
                - last_updated: Text field storing the timestamp of the last update to the repository.

                Issues Table:
                - The issues table stores information about issues associated with a repository.
                - Each row corresponds to a single issue.
                - It includes columns such as:
                - id: An integer serving as the primary key.
                - issue_number: Integer field indicating the number assigned to the issue.
                - title: Text field for the title of the issue.
                - opened_by: Text field representing the username of the person who opened the issue.
                - labels: Text field containing JSON representation of labels associated with the issue.
                - state: Text field indicating the state of the issue (open/closed).
                - created_at: Text field storing the timestamp when the issue was created.
                - updated_at: Text field storing the timestamp when the issue was last updated.
                - closed_at: Text field storing the timestamp when the issue was closed, if applicable.

                Pull Requests Table:
                - The pull requests table stores details about pull requests made to a repository.
                - Each row represents a single pull request.
                - It contains columns such as:
                - id: An integer serving as the primary key.
                - url: Text field containing the URL of the pull request.
                - pr_id: Integer field indicating the identifier for the pull request.
                - state: Text field indicating the state of the pull request (open/closed).
                - title: Text field for the title of the pull request.
                - user_login: Text field representing the username of the user who submitted the pull request.
                - body: Text field containing the body/content of the pull request.
                - created_at: Text field storing the timestamp when the pull request was created.
                - updated_at: Text field storing the timestamp when the pull request was last updated.
                - closed_at: Text field storing the timestamp when the pull request was closed, if applicable.
                - merged_at: Text field storing the timestamp when the pull request was merged, if applicable.
                - merge_commit_sha: Text field storing the SHA of the merge commit, if applicable.
                - labels: Text field containing JSON representation of labels associated with the pull request.
                
                
            When you are done, respond with a final answer between <final_answer></final_answer>.
            Make sure the action input is a detailed query because the more detailed the query, the more accurate the answer will be.
            Use the following format:

            Question: the input question you must answer
            Thought: you should always think about what to do
            Action: the action to take, should be one or both [{tool_names}]
            Action Input: the input to the action
            Observation: the result of the action
            ... (this Thought/Action/Action Input/Observation can repeat N times)
            Thought: I now know the final answer
            Final Answer: the final answer to the original input question

            Begin!

            Question: {input}
            Thought:{agent_scratchpad}
            '''
template = """I want you to act as a coding expert, and an expert on the code contents of a github repository. 
Answer the question concisely and informatively. If you need more information, ask for it. If you don't know the answer, say so. 
Here is the content of the repository:
{context}
Question: {question}
Helpful Answer:"""
QA_CHAIN_PROMPT = PromptTemplate(input_variables=["context", "question"], template=template)

SQL_Prompt = PromptTemplate.from_template(
    """Given the following user question, corresponding SQL query, and SQL result, answer the user question.

        Here is the structure of the database:
        Repository Table:
        - The repository table stores general information about a repository.
        - Each entry in this table represents a single repository.
        - It includes columns such as:
        - id: An integer serving as the primary key.
        - author: Text field representing the author of the repository.
        - owner_login: Text field containing the login name of the repository owner.
        - description: Text field for the description of the repository.
        - forks_count: Integer field indicating the number of forks for the repository.
        - open_issues_count: Integer field indicating the count of open issues in the repository.
        - watchers: Integer field representing the number of users watching the repository.
        - last_updated: Text field storing the timestamp of the last update to the repository.

        Issues Table:
        - The issues table stores information about issues associated with a repository.
        - Each row corresponds to a single issue.
        - It includes columns such as:
        - id: An integer serving as the primary key.
        - issue_number: Integer field indicating the number assigned to the issue.
        - title: Text field for the title of the issue.
        - opened_by: Text field representing the username of the person who opened the issue.
        - labels: Text field containing JSON representation of labels associated with the issue.
        - state: Text field indicating the state of the issue (open/closed).
        - created_at: Text field storing the timestamp when the issue was created.
        - updated_at: Text field storing the timestamp when the issue was last updated.
        - closed_at: Text field storing the timestamp when the issue was closed, if applicable.

        Pull Requests Table:
        - The pull requests table stores details about pull requests made to a repository.
        - Each row represents a single pull request.
        - It contains columns such as:
        - id: An integer serving as the primary key.
        - url: Text field containing the URL of the pull request.
        - pr_id: Integer field indicating the identifier for the pull request.
        - state: Text field indicating the state of the pull request (open/closed).
        - title: Text field for the title of the pull request.
        - user_login: Text field representing the username of the user who submitted the pull request.
        - body: Text field containing the body/content of the pull request.
        - created_at: Text field storing the timestamp when the pull request was created.
        - updated_at: Text field storing the timestamp when the pull request was last updated.
        - closed_at: Text field storing the timestamp when the pull request was closed, if applicable.
        - merged_at: Text field storing the timestamp when the pull request was merged, if applicable.
        - merge_commit_sha: Text field storing the SHA of the merge commit, if applicable.
        - labels: Text field containing JSON representation of labels associated with the pull request.

        Now, given the following user question, SQL query, and SQL result, provide the answer to the user question.
        Question: {question}
        SQL Query: {query}
        SQL Result: {result}
        Answer: """
        )
db = SQLDatabase.from_uri("sqlite:///metadata-db/awesome-for-beginners.db")
toolkit = SQLDatabaseToolkit(db=db, llm=llm)
tools = toolkit.get_tools()

prefix = """
You are an agent designed to interact with a github repo metadata sqlite database.
Given an input question, create a syntactically correct {dialect} query to run, then look at the results of the query and return the answer.
You can order the results by a relevant column to return the most interesting examples in the database.

Never query for all the columns from a specific table, only ask for the relevant columns given the question.
You have access to tools for interacting with the database.

Only use the below tools. Only use the information returned by the below tools to construct your final answer.
You MUST double check your query before executing it. If you get an error while executing a query, rewrite the query and try again.
Note: you must always use double quotation marks (" ") for column names in SQL queries for avoid syntax error

If the question does not seem related to the repo metadata database (issues, pull requests, etc), just return "I don't know" as the answer.
"""
suffix = """Begin!

Question: {input}
Thought: I should used teradata_search_tool to finding relevant syntax first.
{agent_scratchpad}"""

execute_query = QuerySQLDataBaseTool(db=db)
write_query = create_sql_query_chain(llm, db)

def chat_openai(repoName, question):
    vectordb = Chroma(persist_directory=persist_directory, 
                embedding_function=embedding,
                collection_name=repoName,
                )
    retriever = vectordb.as_retriever(search_kwargs={"k": 5})
    qa_chain = RetrievalQA.from_chain_type(
                                    llm=llm, 
                                    # llm=groq,
                                    chain_type="stuff", 
                                    retriever=retriever, 
                                    return_source_documents=True,
                                    chain_type_kwargs={"prompt": QA_CHAIN_PROMPT},
                                    )
    print(db.get_usable_table_names())
    sql_chain = create_sql_query_chain(llm, db)
    SQLanswer = SQL_Prompt | llm | StrOutputParser()
    chain = (
        RunnablePassthrough.assign(query=write_query).assign(
            result=itemgetter("query") | execute_query
        )
        | SQLanswer
    )


    
    @tool
    def CodeBaseSearchTool(human_message: str) -> str:
        """
        Searches for the codebase for the answer and returns the relevant code snippet to determine the answer.
        """
        res = qa_chain.invoke(human_message)
        answer = str(res["source_documents"][0])
        return answer
    


    agent_executor = create_sql_agent(
        llm=llm,
        toolkit=toolkit,
        verbose=True,
        agent_type=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
        extra_tools=[CodeBaseSearchTool],
        prefix=prefix,
        suffix=suffix
    )
    for chunk in agent_executor.stream({"input": question, "agent_scratchpad": "I will determine which tool(s) to use to answer the type of question."}):
        print(list(chunk.keys()))
        # # Agent Action
        # if "actions" in chunk:
        #     for action in chunk["actions"]:
        #         print(
        #             f"Calling Tool ```{action.tool}``` with input ```{action.tool_input}```"
        #         )
        # # # Observation
        # # elif "steps" in chunk:
        # #     for step in chunk["steps"]:
        # #         print(f"Got result: ```{step.observation}```")
        # if "final_answer" in chunk:
        #     finalAnswer = (f"Final Answer: ```{str(chunk['final_answer'])}```")
        #     print("=====================================")
        #     print(finalAnswer)
        #     return finalAnswer

    

    # while True:
    #     # query = input("Question: ")
    #     query = question
    #     if query.strip() == "":
    #         continue
    #     res = qa_chain.invoke(query)
    #     process_llm_response(res)
    #     print(type(res))
    #     return res
        
# ## Cite sources
# def process_llm_response(llm_response):
#     print(type(llm_response))
#     result = '\n' + llm_response['result'] + '\n\nSources:\n' + '\n'.join(source.metadata['source'] for source in llm_response["source_documents"])
#     print(result)

