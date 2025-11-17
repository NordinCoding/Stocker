FROM python:3.12-alpine

# Install build deps (for psycopg2 and similar packages)
RUN apk add --no-cache postgresql-client postgresql-dev gcc python3-dev musl-dev

# Copy requirement file first for caching
COPY ./requirements.txt /requirements.txt

# Install dependencies into a virtual environment
RUN python -m venv .venv /py && \
    /py/bin/pip install --upgrade pip && \
    /py/bin/pip install -r /requirements.txt

# Create a working directory
WORKDIR /stocker/stocker

# Copy the rest of the backend project
COPY ./ /stocker

# Add venv to PATH
ENV PATH="/py/bin:$PATH"

EXPOSE 8000

CMD ["uvicorn", "stocker.asgi:application", "--host", "0.0.0.0", "--port", "8000"]