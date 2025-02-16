FROM oven/bun:debian

LABEL org.opencontainers.image.source="https://github.com/ivan-demchenko/job-seekr-app"

ENV PATH="~/.bun/bin:${PATH}"

RUN ln -s /usr/local/bin/bun /usr/local/bin/node

WORKDIR /app

COPY . .

RUN bun install

EXPOSE 3000

CMD ["bun", "index.ts"]