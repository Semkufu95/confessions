# Start from the official Golang image
FROM golang:1.24.4-alpine

#set environment variables
ENV GO111MODULE=on \
    CGO_ENABLED=0 \
    GOOS=linux \
    GOARCH=amd64

# set working directory in container
WORKDIR /app

#Install build dependencies
COPY go.mod go.sum ./
RUN go mod download

# copy the rest of the source code
COPY . .

#Build the binary
RUN go build -o confessions

#Expose Fibers default port
EXPOSE 5000

#Run Command

CMD ["./confessions"]