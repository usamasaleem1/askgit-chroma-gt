FROM python:3.10-slim

WORKDIR /app

RUN apt-get update && apt-get install -y git

ENV PATH="/usr/bin/git:${PATH}"

COPY requirements.txt /app/

RUN pip install -r requirements.txt

COPY . /app/

EXPOSE 8000

ENTRYPOINT ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0"]
