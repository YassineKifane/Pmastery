#### Stage 1: Build the application
FROM openjdk:17-oracle as build
# Set the current working directory inside the image
# mkdir app && cd app
WORKDIR /app
# Copy maven executable to the image
COPY mvnw .
COPY .mvn .mvn
# Copy the pom.xml file
COPY pom.xml .
# Build the dependencies in preparation to go offline.
# This is a separate step so the dependencies will be cached unless
# the pom.xml file has changed
RUN sed -i -e 's/\r$//' mvnw
RUN ./mvnw dependency:go-offline -B
# Copy the project source
COPY src src
# Package the application
RUN ./mvnw package -DskipTests
RUN mkdir -p target/dependency && (cd target/dependency; jar -xf ../*.jar)

### Stage 2: A minimal docker image with command to run the app
FROM openjdk:17-oracle

ARG DEPENDENCY=/app/target/dependency

# Copy project dependencies from the build stage
COPY --from=build ${DEPENDENCY}/BOOT-INF/lib /app/lib
COPY --from=build ${DEPENDENCY}/META-INF /app/META-INF
COPY --from=build ${DEPENDENCY}/BOOT-INF/classes /app

ENTRYPOINT ["java","-cp","app:app/lib/*","com.pfa.pmastery.app.PfaPMasteryApplication"]
