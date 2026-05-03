# Base image (Keep it consistent and lightweight)
FROM python:3.11

# Set working directory
WORKDIR /app

# Copy dependency definition
COPY ./requirements.txt /app/requirements.txt

#RUN pip config --user set global.index https://mirror-pypi.runflare.com/simple
#RUN pip config --user set global.index-url https://mirror-pypi.runflare.com/simple
#RUN pip config --user set global.trusted-host mirror-pypi.runflare.com
RUN export PIP_INDEX_URL=https://package-mirror.liara.ir/repository/pypi/simple


# Install dependencies
RUN pip install --upgrade pip && \
    pip install -r requirements.txt && \
    pip install uvicorn[standard]

# Copy the rest of the application code
COPY ./alembic.ini /app/alembic.ini
COPY ./alembic /app/alembic
COPY ./src /app/src

# Create a non-root user for security
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser
USER appuser

# Expose the port the app runs on
EXPOSE 8000

# Command to run the application
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]