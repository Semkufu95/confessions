# Start from the official Golang image
FROM golang:1.25-alpine AS dev

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

#Expose Fibers default port
EXPOSE 5000

# Install Air for live reloading
RUN go install github.com/air-verse/air@latest
ENV PATH="$PATH:/root/go/bin"


#Run Command with Air
CMD ["air", "-c", ".air.toml"]