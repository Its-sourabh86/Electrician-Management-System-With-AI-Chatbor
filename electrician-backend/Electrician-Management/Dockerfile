# Stage 1: Build the application
# We use a Docker image that has Maven and Java 21 pre-installed to build the JAR
FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY . .
# Build the application (skipping tests to save time during deploy)
RUN mvn clean package -DskipTests

# Stage 2: Run the application
# We use a lightweight Java 21 image for the final container
FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app
# Copy the built JAR from the 'build' stage
COPY --from=build /app/target/Electrician-Management-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8083
ENTRYPOINT ["java","-jar","app.jar"]
