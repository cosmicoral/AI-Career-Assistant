import { spawn } from "node:child_process";

const commands = [
  { name: "web", args: ["run", "dev", "-w", "@careeros/web"] },
  { name: "api", args: ["run", "dev", "-w", "@careeros/api"] }
];

const children = commands.map((command) => {
  const child = spawn("npm", command.args, {
    stdio: "inherit",
    shell: false
  });

  child.on("exit", (code, signal) => {
    if (signal) {
      console.log(`${command.name} stopped with ${signal}`);
      return;
    }

    if (code && code !== 0) {
      console.error(`${command.name} exited with code ${code}`);
      process.exitCode = code;
      children.forEach((otherChild) => {
        if (otherChild !== child) {
          otherChild.kill("SIGTERM");
        }
      });
    }
  });

  return child;
});

function shutdown(signal) {
  children.forEach((child) => child.kill(signal));
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
