# Base image (Keep it consistent and lightweight)
FROM docker.arvancloud.ir/python:3.11-slim

# Set working directory
WORKDIR /app

# ----------------------------------------------------------------------
# Setup: Install dependencies and Uvicorn for development
# ----------------------------------------------------------------------
# Copy requirements and install
COPY ./requirements.txt /app/requirements.txt
RUN pip install --upgrade pip && \
    pip install -r requirements.txt && \
    # Install Uvicorn explicitly to ensure development server is available
    pip install uvicorn[standard]

# Copy database migration files
COPY ./alembic.ini /app/alembic.ini
COPY ./alembic /app/alembic

# Set up a non-root user for security
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser
USER appuser

# Copy source code (Needed for initial image build, changes handled by volumes)
COPY ./src /app/src

# expose the port
EXPOSE 8000

# ----------------------------------------------------------------------
# Development Command: Run Uvicorn with Auto-Reload
# ----------------------------------------------------------------------
# IMPORTANT: The --reload flag enables hot-reloading when local source files change.
# This works in conjunction with the volume mapping in docker-compose.dev.yml.
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
