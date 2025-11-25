# Build stage
FROM golang:1.23-alpine AS builder

WORKDIR /app

# Copy go mod files
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build
RUN CGO_ENABLED=0 GOOS=linux go build -o kite-mcp-server .

# Runtime stage
FROM alpine:latest

WORKDIR /app

# Copy binary from builder
COPY --from=builder /app/kite-mcp-server .
COPY --from=builder /app/kc/templates ./kc/templates

# Expose port
EXPOSE 8080

# Run
CMD ["./kite-mcp-server"]

