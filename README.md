# job-seekr-app

## Dev mode

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.2.2. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

## Run the app

```
docker run -d -p 3000:3000 -v ${PWD}/db:/app/database -v ${PWD}/reports:/app/files ghcr.io/ivan-demchenko/job-seekr-app:latest
```

Now you can open [http://localhost:3000](http://localhost:3000) and track your applications
