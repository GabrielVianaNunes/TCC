# ---- Estágio de build ----
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /build
COPY pom.xml .
COPY src ./src
# application.properties é local/gitignorado e nunca entra no contexto de build
# (ver .dockerignore) — a imagem sempre usa o template seguro como base, e a
# configuração real vem só de variáveis de ambiente em tempo de execução.
RUN cp src/main/resources/application.properties.example src/main/resources/application.properties
RUN mvn clean package -DskipTests -B

# ---- Estágio final ----
FROM eclipse-temurin:21-jre
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends wget gnupg2 lsb-release ca-certificates \
    && wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | gpg --dearmor -o /usr/share/keyrings/postgresql-keyring.gpg \
    && echo "deb [signed-by=/usr/share/keyrings/postgresql-keyring.gpg] https://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list \
    && apt-get update && apt-get install -y --no-install-recommends postgresql-client-16 \
    && apt-get purge -y --auto-remove wget gnupg2 \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build /build/target/pilot-0.0.1-SNAPSHOT.jar app.jar

# Usuário sem privilégio para rodar a aplicação — o contêiner não precisa de
# root em tempo de execução (a instalação de pacotes acima já terminou).
# /data/pdfs é criado e transferido para esse usuário ANTES do volume nomeado
# ser montado ali: um volume nomeado vazio herda a dona/permissão do
# diretório da imagem na primeira montagem, então isso precisa acontecer
# aqui, não depois de rodando.
RUN groupadd --system app \
    && useradd --system --gid app --no-create-home --shell /usr/sbin/nologin app \
    && mkdir -p /data/pdfs \
    && chown -R app:app /app /data/pdfs

USER app

EXPOSE 8090
ENTRYPOINT ["java", "-jar", "app.jar"]
