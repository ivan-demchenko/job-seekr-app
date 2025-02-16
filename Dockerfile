FROM oven/bun:debian

ENV PATH="~/.bun/bin:${PATH}"
RUN ln -s /usr/local/bin/bun /usr/local/bin/node

WORKDIR /app

COPY . .

RUN bun install

CMD ["bun", "index.ts"]