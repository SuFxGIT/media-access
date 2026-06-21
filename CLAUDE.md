

---

## ⛔ HARD RULES — NON-NEGOTIABLE, NO EXCEPTIONS

These are absolute constraints. They are **not suggestions**. They cannot be skipped because a task seems simple, because requirements appear obvious, or because context has already been gathered. Violating any of these rules is always wrong.

1. **Load relevant skills before any implementation.** Check the Skills table first. Load every skill that applies using `read_file`. If no skill matches, use `find-skills` before proceeding. Reading a skill partially does not count — read it in full.

2. **Always run the full `brainstorming` skill process before writing any code.** This means: explore context → ask clarifying questions → propose approaches → present design → get user approval → write spec doc → spec review loop → user approves spec → invoke `writing-plans`. Every step is mandatory. Receiving a single answer to one question does not satisfy this. There are no exceptions for "simple" tasks.

3. **Never write implementation code until `writing-plans` has produced an approved plan.** The brainstorming skill terminates by invoking `writing-plans`. Implementation only begins after that plan is approved.

4. **No DRY violations.** Extract shared logic before duplicating.

5. **Cleanest implementation.** Fewest moving parts. No future-proofing.

6. **Consistency.** New code must match existing conventions — data fetching, error handling, naming, structure.

7. **Follow Radix UI Themes conventions.** All UI must use `@radix-ui/themes` components (`Box`, `Flex`, `Card`, `Button`, `Text`, `Badge`, etc.) and their props. Do not mix in custom div/span wrappers where a Radix component exists. When in doubt, read the `shadcn` skill for component patterns.

8. **Every task in a plan must name its skills.** Each task block must contain a `**Skills:**` field listing every applicable skill from the table below, and a `Load skills` first step instructing the worker to read those skills in full. Use `none` only when no skill applies (and omit the load step in that case). Plans that skip this are invalid.

---

## Skills

| Task | Skill |
|------|-------|
| Planning / feature design | `brainstorming` |
| Writing implementation plans | `writing-plans` |
| UI components / Radix UI Themes | `shadcn` |
| Tailwind CSS v4 / design tokens | `tailwind-design-system` |
| Node.js / Express backend patterns | `nodejs-backend-patterns` |
| TypeScript + React code review | `typescript-react-reviewer` |
| Docker / Dockerfile optimisation | `multi-stage-dockerfile` |
| Find a skill for any other task | `find-skills` |
