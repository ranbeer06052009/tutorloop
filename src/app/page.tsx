import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-10">
      <header className="flex items-center justify-between">
        <p className="font-serif text-2xl tracking-tight">TutorLoop</p>
        <Link
          href="/desk"
          className="rounded-full bg-moss px-5 py-2 text-sm font-semibold text-paper hover:bg-moss-deep"
        >
          Open the desk
        </Link>
      </header>

      <section className="mt-16 grid gap-10 md:grid-cols-[1.2fr_0.8fr] md:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-moss">
            Side hustle for tutors
          </p>
          <h1 className="mt-4 font-serif text-5xl leading-[1.05] text-ink md:text-6xl">
            Close the session. Text the parent. Send the invoice.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink/75">
            Student tutors already get paid for the hour. They lose the next twenty minutes
            writing a recap, inventing homework, and chasing money. TutorLoop runs an
            open-weight Gemma model on those messy notes so client names never have to
            leave a laptop — and still keeps a proper ledger on MongoDB Atlas.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/desk"
              className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-paper"
            >
              Run a session close
            </Link>
            <a
              href="https://dev.to/challenges/hacktoberfest-week2-2026-10-12"
              className="rounded-full border border-ink/20 px-6 py-3 text-sm font-semibold"
            >
              HF26 Week 2
            </a>
          </div>
        </div>

        <aside className="rounded-3xl border border-rule bg-paper/80 p-6 shadow-[0_20px_50px_rgba(28,23,18,0.08)]">
          <div className="flex items-start justify-between">
            <p className="text-xs uppercase tracking-[0.18em] text-ink/50">Invoice 014</p>
            <span className="stamp">Due</span>
          </div>
          <p className="mt-6 font-serif text-3xl">Aarav · Physics</p>
          <p className="mt-2 text-sm text-ink/60">1.5 hours · quadratic graphs</p>
          <hr className="my-5 border-rule" />
          <p className="text-sm leading-relaxed text-ink/80">
            Hi Meera — Aarav is solid on plotting. Today we hunted sign errors in
            completing the square. Homework is two textbook problems, 20 minutes.
          </p>
          <p className="mt-6 font-serif text-4xl text-moss">₹750</p>
        </aside>
      </section>

      <section className="mt-20 grid gap-6 md:grid-cols-3">
        {[
          {
            title: "Gemma, not a mystery API",
            body: "Ollama locally, or hosted Gemma on Render. Swap the weights without rewriting the product.",
          },
          {
            title: "A ledger parents can trust",
            body: "Every recap, homework list, and rupee amount lands in MongoDB Atlas — queryable, not a chat log.",
          },
          {
            title: "Priced like a side hustle",
            body: "Closed models bill per parent message. Your own model is electricity. That is why this business works.",
          },
        ].map((card) => (
          <article key={card.title} className="rounded-2xl border border-rule bg-paper/70 p-5">
            <h2 className="font-serif text-xl">{card.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-ink/70">{card.body}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
