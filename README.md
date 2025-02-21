# job-seekr-app

This app was born during my job search.

If you're looking for a job, I hope you'll find something quickly.

## How to run it?

I deliberately designed this app to run locally. I want your data to belong to you.

So you can use Docker to spin it up using this command:

```sh
docker run -d --name job-seekr-app -p 3000:3000 -v ./db:/app/database -v ./reports:/app/files ghcr.io/ivan-demchenko/job-seekr-app:latest
```

Just type this line into your terminal and a few moments later you can open [http://localhost:3000](http://localhost:3000) to get started.

What this command does is tell Docker to download the app, run it locally and in isolation, and give the app access to two folders on your machine:

```
./db - for the database
./reports - for the generated PDFs
```

To stop the app, use:

```
docker kill job-seekr-app
```

But you don't have to - it can sit there like a website running on your machine.

## How to contribute

If you want to suggest an idea or a change, I (and the rest of the users) will appreciate it! Your name will appear on the About page.

### Contributing the code

This project was created using `bun init` in bun v1.2.2. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime. Install the dependencies:

```bash
bun install
```

... and run it:

```bash
bun run index.ts
```

Play around with it and submit a PR. Any other suggestions are also welcome.

#### If you change DB schema

- Generate the migration script:
  ```sh
  bun run db:migration:generate
  ```

- Execute the migration:
  ```
  db:migration:run
  ```

### Other types of contributions

I'm happy to review any design suggestions, just create an issue here on GitHub.

Finally, any financial support would be greatly appreciated - <a href="https://buymeacoffee.com/ivan.demchenko" target="_blank">Buy me a coffee</a>