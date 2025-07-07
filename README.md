# MedQuizBackEnd

## Docker Usage

### Build the Docker image
```
docker build -t medquiz-backend .
```

### Run the Docker container
```
docker run -p 5000:5000 --env-file .env medquiz-backend
```

- Make sure to set up your `.env` file with the required environment variables (e.g., MONGO_URI, NODE_ENV, PORT).