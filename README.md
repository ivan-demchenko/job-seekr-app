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
docker run -d --name job-seekr-app -p 3000:3000 -v ./db:/app/database -v ./reports:/app/files ghcr.io/ivan-demchenko/job-seekr-app:latest
```

Now you can open [http://localhost:3000](http://localhost:3000) and track your applications

And to stop the app, use:

```
docker kill job-seekr-app
```
