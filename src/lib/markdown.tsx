import React from 'react';

/* =========================================================================
 * A SMALL MARKDOWN RENDERER FOR MODEL REPLIES
 *
 * The cross-examiner answers in Markdown. Rendered as plain text those
 * answers arrive full of literal ###, ** and --- , which reads as broken
 * rather than as formatting.
 *
 * Two deliberate constraints:
 *
 *   Safety.  Everything below builds React elements. Nothing goes through
 *            dangerouslySetInnerHTML, so model output cannot inject markup
 *            no matter what it returns. That rules out a string-replacing
 *            implementation, which is the usual shape of this bug.
 *
 *   Scope.   Only the constructs the model actually emits — headings,
 *            bold, italic, inline code, fenced code, lists, rules. Anything
 *            unrecognised falls through and renders as its own literal
 *            text, so an unexpected construct degrades to plain prose
 *            rather than disappearing.
 *
 * This is not a general Markdown implementation and should not grow into
 * one. If the formatting needs outgrow it, take the dependency instead.
 * ========================================================================= */

/** Inline spans: **bold**, *italic*, _italic_, `code`. */
function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const pattern = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*\n]+\*|_[^_\n]+_)/g;
  const out: React.ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  let i = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) out.push(text.slice(last, match.index));
    const token = match[0];
    const key = `${keyPrefix}-i${i++}`;

    if (token.startsWith('**')) {
      out.push(
        <strong key={key} className="font-bold text-white">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('`')) {
      out.push(
        <code key={key} className="px-1 py-0.5 rounded bg-zinc-800 text-[11px] font-mono text-pink-200">
          {token.slice(1, -1)}
        </code>
      );
    } else {
      out.push(
        <em key={key} className="italic text-zinc-100">
          {token.slice(1, -1)}
        </em>
      );
    }
    last = match.index + token.length;
  }

  if (last < text.length) out.push(text.slice(last));
  return out;
}

/**
 * Render a Markdown reply as React elements.
 *
 * Block handling is line-based, which is all the model's output needs and
 * keeps the whole thing legible.
 */
export function renderMarkdown(source: string): React.ReactNode {
  const lines = String(source ?? '').replace(/\r\n/g, '\n').split('\n');
  const blocks: React.ReactNode[] = [];

  /* Markdown's hard line break is two trailing spaces. The model uses it
   * for label lines ("**Claimed:** ... / **Observed:** ..."), which run
   * together into one sentence if the flag is trimmed away and forgotten. */
  let paragraph: { text: string; hardBreak: boolean }[] = [];
  let list: string[] = [];
  let code: string[] | null = null;
  let n = 0;

  const flushParagraph = () => {
    if (!paragraph.length) return;
    const lines = paragraph;
    paragraph = [];
    const key = `p${n++}`;

    const nodes: React.ReactNode[] = [];
    let run: string[] = [];
    lines.forEach((entry, idx) => {
      run.push(entry.text);
      const isLast = idx === lines.length - 1;
      if (entry.hardBreak || isLast) {
        const text = run.join(' ').trim();
        run = [];
        if (text) nodes.push(...renderInline(text, `${key}-${idx}`));
        if (entry.hardBreak && !isLast) nodes.push(<br key={`${key}-br${idx}`} />);
      }
    });

    if (nodes.length) {
      blocks.push(
        <p key={key} className="leading-relaxed">
          {nodes}
        </p>
      );
    }
  };

  const flushList = () => {
    if (!list.length) return;
    const items = list;
    list = [];
    blocks.push(
      <ul key={`u${n++}`} className="list-disc pl-5 space-y-1">
        {items.map((item, idx) => (
          <li key={idx}>{renderInline(item, `u${n}-${idx}`)}</li>
        ))}
      </ul>
    );
  };

  const flushAll = () => {
    flushParagraph();
    flushList();
  };

  for (const raw of lines) {
    const hardBreak = /\S {2,}$/.test(raw);
    const line = raw.trimEnd();

    // Fenced code, and $$…$$ blocks, which the model sometimes uses for
    // notation. Neither is prose; both are shown verbatim in monospace
    // rather than mangled into it.
    if (/^\s*(```|\$\$)/.test(line)) {
      if (code === null) {
        flushAll();
        code = [];
      } else {
        blocks.push(
          <pre
            key={`c${n++}`}
            className="overflow-x-auto rounded bg-zinc-950 border border-zinc-800 p-2 text-[11px] font-mono text-zinc-300"
          >
            {code.join('\n')}
          </pre>
        );
        code = null;
      }
      continue;
    }
    if (code !== null) {
      code.push(raw);
      continue;
    }

    if (!line.trim()) {
      flushAll();
      continue;
    }

    const heading = /^(#{1,6})\s+(.*)$/.exec(line);
    if (heading) {
      flushAll();
      const depth = heading[1].length;
      blocks.push(
        <p
          key={`h${n++}`}
          className={`font-bold text-white ${depth <= 2 ? 'text-sm' : 'text-xs'} pt-1`}
        >
          {renderInline(heading[2], `h${n}`)}
        </p>
      );
      continue;
    }

    if (/^\s*([-*_])\1{2,}\s*$/.test(line)) {
      flushAll();
      blocks.push(<hr key={`r${n++}`} className="border-zinc-800" />);
      continue;
    }

    const bullet = /^\s*[-*+]\s+(.*)$/.exec(line) || /^\s*\d+[.)]\s+(.*)$/.exec(line);
    if (bullet) {
      flushParagraph();
      list.push(bullet[1]);
      continue;
    }

    flushList();
    paragraph.push({ text: line.trim(), hardBreak });
  }

  // An unterminated fence still has to render something.
  if (code !== null && code.length) {
    blocks.push(
      <pre
        key={`c${n++}`}
        className="overflow-x-auto rounded bg-zinc-950 border border-zinc-800 p-2 text-[11px] font-mono text-zinc-300"
      >
        {code.join('\n')}
      </pre>
    );
  }
  flushAll();

  return <div className="space-y-2">{blocks}</div>;
}
