FROM docker.arvancloud.ir/python:3.11-slim
#FROM python:3.11-slim

WORKDIR /app

COPY ./requirements.txt /app/requirements.txt

RUN pip install --upgrade pip && \
    pip install -r requirements.txt

RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser
USER appuser

COPY ./src /app/src

EXPOSE 8000