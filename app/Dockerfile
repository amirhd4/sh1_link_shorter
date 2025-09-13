FROM docker.arvancloud.ir/python:3.11-slim
#FROM python:3.11-slim

WORKDIR /app

COPY ./requirements.txt /app/requirements.txt

RUN pip install --upgrade pip && \
    pip install -r requirements.txt

COPY ./src /app/src

EXPOSE 8000