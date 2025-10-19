import type { ContentBlock } from "../shared/Types/types";
import { type JSX } from "react";

export function renderBlock(block: ContentBlock, idx: number): JSX.Element {
  switch (block.type) {
    case "h1":
      return <h1 key={idx}>{block.content}</h1>;

    case "h2":
      return <h2 key={idx}>{block.content}</h2>;

    case "p":
      return <p key={idx}>{block.content}</p>;

    case "img":
      return (
        <img
          key={idx}
          src={block.content as string}
          alt=""
          style={{ maxWidth: "100%" }}
        />
      );

    case "ul":
      return (
        <ul key={idx}>
          {(block.content as any[]).map((li, j) => (
            <li key={j}>{li.content}</li>
          ))}
        </ul>
      );

    case "ol":
      return (
        <ol key={idx}>
          {(block.content as any[]).map((li, j) => (
            <li key={j}>{li.content}</li>
          ))}
        </ol>
      );

    default:
      // на всякий случай для неизвестных типов
      return (
        <div key={idx}>
          <strong>{block.type}:</strong> {String(block.content)}
        </div>
      );
  }
}
