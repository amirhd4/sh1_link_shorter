FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
# RUN pip install --no-cache-dir --upgrade pip -r requirements.txt
RUN pip install --upgrade pip -r requirements.txt

COPY ./src /app/src

EXPOSE 8000