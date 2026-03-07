FROM eclipse-temurin:25-jdk-alpine AS build
WORKDIR /workspace

COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw

RUN --mount=type=cache,target=/root/.m2 \
    ./mvnw -DskipTests -Pdocker dependency:go-offline -B || true

COPY src/ src/

RUN --mount=type=cache,target=/root/.m2 \
    ./mvnw -DskipTests -Pdocker package -B -q

FROM eclipse-temurin:25-jre-alpine
WORKDIR /app

RUN adduser -D -h /app spring
USER spring

COPY --from=build /workspace/target/devo_carre-0.0.1-SNAPSHOT.jar /app/app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "/app/app.jar"]
