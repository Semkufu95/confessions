import React from "react";

interface SafeMultilineTextProps {
    text: string;
    className?: string;
    paragraphClassName?: string;
    emptyFallback?: string;
}

export function SafeMultilineText({
    text,
    className,
    paragraphClassName,
    emptyFallback = "",
}: SafeMultilineTextProps) {
    const normalized = (text || "").replace(/\r\n?/g, "\n").trim();
    if (!normalized) {
        return emptyFallback ? <p className={paragraphClassName}>{emptyFallback}</p> : null;
    }

    const paragraphs = normalized.split(/\n{2,}/).filter((paragraph) => paragraph.trim() !== "");

    return (
        <div className={className}>
            {paragraphs.map((paragraph, paragraphIndex) => {
                const lines = paragraph.split("\n");
                return (
                    <p key={`paragraph-${paragraphIndex}`} className={paragraphClassName}>
                        {lines.map((line, lineIndex) => (
                            <React.Fragment key={`line-${paragraphIndex}-${lineIndex}`}>
                                {line}
                                {lineIndex < lines.length - 1 ? <br /> : null}
                            </React.Fragment>
                        ))}
                    </p>
                );
            })}
        </div>
    );
}

